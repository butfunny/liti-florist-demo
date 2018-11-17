import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {responsive} from "../../common/responsive/responsive";
import {ReportTableMobile} from "./report-table-mobile";
import moment from "moment";
import {filteredByKeys, formatNumber, getDates, getTotalBill, resizeImage} from "../../common/common";
import {userInfo} from "../../security/user-info";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import sum from "lodash/sum";
import sortBy from "lodash/sortBy";
import {Input} from "../../components/input/input";
import {PrintService} from "../../common/print-service/print-service";
import {BillPrint} from "../bill/print/bill-print";
import {modals} from "../../components/modal/modals";
import {ReasonDisplayModal} from "./reason-display-modal";
import {RComponent} from "../../components/r-component/r-component";
import {CSVLink, CSVDownload} from 'react-csv';
import omit from "lodash/omit";
import {Checkbox} from "../../components/checkbox/checkbox";
import {configApi} from "../../api/config-api";
import classnames from "classnames";
import {uploadApi} from "../../api/upload-api";

export class BillOrderRoute extends RComponent {

    constructor(props) {
        super(props);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            from: today,
            to: endDay,
            bills: null,
            keyword: "",
            logs: [],
            showOwe: false
        };

        premisesInfo.onChange(() => {
            this.getBills();
        });

        this.getBills();

    }

    getBills() {

        this.setState({loading: true});
        billApi.getBills(premisesInfo.getActivePremise()._id, {from: this.state.from, to: this.state.to}).then(({bills, customers, logs}) => {
            this.setState({bills: bills.map(bill => {
                return {
                    ...bill,
                    lastTime: new Date(bill.delivery_time).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.delivery_time).getTime() - new Date().getTime()) : new Date(bill.delivery_time).getTime() - new Date().getTime()
                }
            }), customers, logs, loading: false})
        })
    }

    updateBill(bill, status) {
        let {bills} = this.state;
        this.setState({bills: bills.map((b) => bill._id == b._id ? {...b, status} : b)});
        billApi.updateBillStatus(bill._id, {status});
    }

    remove(bill) {

        let {bills} = this.state;

        confirmModal.show({
            title: "Bạn muốn xoá hoá đơn này chứ?",
            description: "Sau khi xoá mọi dữ liệu về hoá đơn sẽ biến mất."
        }).then(() => {
            this.setState({bills: bills.filter(b => b._id != bill._id)});
            billApi.removeBill(bill._id);
        })
    }


    print(bill) {
        PrintService.printBill({
            body: (
                <BillPrint
                    bill={bill}
                />
            )
        })
    }

    showLog(logs) {
        const modal = modals.openModal({
            content: <ReasonDisplayModal
                onDismiss={() => modal.close()}
                logs={logs}
            />
        })
    }

    removeOwe(bill) {
        confirmModal.show({
            title: "Xoá nợ",
            description: "Bạn có chắc chắn muốn xoá nợ hoá đơn này?"
        }).then(() => {
            billApi.updateBill(bill._id, {
                ...omit(bill, ["_id"]),
                reason: "Xoá nợ.",
                update_time: new Date(),
                payment_type: "Đã trả nợ."
            }).then(() => {
                this.getBills();
            })
        })
    }

    handleChange(e) {
        this.setState({uploading: true});
        if (e.target.files[0]) {
            resizeImage(e.target.files[0]).then((file) => {
                uploadApi.upload(file).then(resp => {
                    this.setState({uploading: false});
                    console.log(resp.file);
                })
            })
        }
    }


    render() {

        let {bills, customers, keyword, from, to, logs, showOwe, max_day_view_report, selectedDate, loading} = this.state;
        let {history} = this.props;

        const getCustomer = (id) => customers.find(c => c._id == id) || {};

        const isMobile = responsive.le("xs");

        const formattedBills = bills ? bills.map(b => ({...b, customer: getCustomer(b.customerId), logs: logs.filter(l => l.bill_id == b._id)})) : [];

        let billsFiltered = bills ? filteredByKeys(formattedBills, ["customer.customerName","customer.customerPhone", "bill_number"], keyword) : bills;

        if (showOwe) billsFiltered = billsFiltered.filter(b => b.to.paymentType == "Nợ");

        let csvData =[
            [
                'Hoá đơn #',
                'Ngày đặt hàng',
                'Ngày giao hàng',
                "Giờ khách nhận",
                "Sale",
                "Florist",
                "Hình thức thanh toán",
                "Tên Khách Đặt",
                "Địa Chỉ Khách Đặt",
                "Số ĐT",
                "Tên Khách Nhận",
                "Địa Chỉ Nhận",
                "SĐT Khách Nhận",
                "Nhân viên ship",
                "Ghi chú",
                "Nội dung thiệp",
                "Mặt Hàng",
                "Tổng Tiền"
            ]
        ];

        const generateBillItemsText = (items) => {
            let ret = "";
            for (let item of items) {
                ret += `${item.quantity} ${item.name} ${item.discount ? `(${item.discount}%)` : ''}\n`
            }
            return ret;
        };
        //
        // if (bills) {
        //     for (let bill of billsFiltered) {
        //         let ret = [];
        //         ret.push(bill.bill_id);
        //         ret.push(moment(bill.created).format("DD/MM/YYYY"));
        //         ret.push(moment(bill.delivery_time).format("DD/MM/YYYY"));
        //         ret.push(moment(bill.delivery_time).format("HH:mm"));
        //         ret.push(bill.created_by.username);
        //         ret.push(bill.florist);
        //         ret.push(bill.payment_type);
        //         ret.push(bill.customer.name);
        //         ret.push(bill.customer.address);
        //         ret.push(bill.customer.phone);
        //         ret.push(bill.receiver_name);
        //         ret.push(bill.receiver_place);
        //         ret.push(bill.receiver_phone);
        //         ret.push(bill.ship);
        //         ret.push(bill.notes);
        //         ret.push(bill.card);
        //         ret.push(generateBillItemsText(bill.items));
        //         ret.push(getTotalBill(bill.items));
        //
        //         csvData.push(ret);
        //     }
        // }

        const user = userInfo.getUser();

        let startDay = new Date();
        startDay.setDate(startDay.getDate() - max_day_view_report);
        startDay.setHours(0, 0, 0, 0);

        const dates = getDates(startDay, new Date());

        return (
            <Layout
                activeRoute="Đơn Hàng"
            >
                <div className="bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Đơn Hàng</h1>
                    </div>


                    <h6>
                        Tổng Đơn: <b className="text-primary">{bills ? bills.length : 0}</b>
                    </h6>
                    <h6>Số Đơn Quá Giờ: <b className="text-danger">{bills ? bills.filter(bill => new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý").length : 0}</b></h6>
                    <h6>Số Đơn Nợ: <b className="text-danger">{bills ? bills.filter(bill => bill.to && bill.to.paymentType == "Nợ").length : 0}</b></h6>


                    <div className="report-header row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label">Từ ngày</label>
                                <DatePicker
                                    value={from}
                                    onChange={(from) => {
                                        this.setState({from})
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label">Tới ngày</label>
                                <DatePicker
                                    value={to}
                                    onChange={(to) => this.setState({to})}
                                />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <button className="btn btn-primary btn-sm btn-get btn-icon"
                                    disabled={loading}
                                    onClick={() => this.getBills()}>
                                Xem Hoá Đơn

                                { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>

                    </div>


                    <CSVLink
                        data={csvData}
                        filename={"baocao.csv"}
                        className="btn btn-primary btn-icon btn-excel btn-sm">
                        <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                        <span className="btn-inner--text">Xuất Excel</span>
                    </CSVLink>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm kiếm"
                        />
                    </div>

                    <div className="form-group">
                        <Checkbox
                            value={showOwe}
                            onChange={(showOwe) => this.setState({showOwe})}
                            label="Lọc nợ"
                        />
                    </div>

                    <div className="report-body">
                        { isMobile ? (
                            <ReportTableMobile
                                bills={sortBy(billsFiltered, "lastTime")}
                                history={history}
                                onRemove={(bill) => this.remove(bill)}
                                user={user}
                                onUpdateBill={(bill, status) => this.updateBill(bill, status)}
                                onShowLog={(logs) => this.showLog(logs)}
                                onRemoveOwe={(bill) => this.removeOwe(bill)}
                            />
                        ) : (
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col"
                                            style={{width: "200px"}}
                                        >Thời gian</th>
                                        <th scope="col">Thông Tin Đơn</th>
                                        <th scope="col"
                                            style={{width: "150px"}}
                                        >Tình trạng</th>
                                        <th
                                            style={{width: "200px"}}
                                            scope="col"/>
                                    </tr>
                                </thead>
                                <tbody>
                                { bills && sortBy(billsFiltered, "lastTime").map((bill, index) => (
                                    <tr key={index} className={classnames(new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý" &&  "text-danger")}>
                                        <td>
                                            {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
                                            <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                                            <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : (bill.to || {}).saleEmp}</b></div>
                                            <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : (bill.to || {}).florist}</b></div>
                                            <div>Nhân viên ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b></div>

                                            { bill.logs.length > 0 && (
                                                <div>
                                                    <span className="text-danger">(Đã chỉnh sửa)</span>
                                                    <div>
                                                        <span className="text-primary" style={{cursor: "pointer"}} onClick={() => this.showLog(bill.logs)}>
                                                            Chi tiết
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                { bill.items.map((item, index) => (
                                                    <div key={index}>
                                                        <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>} {item.vat && <span className="text-primary"> - {item.vat}% VAT</span>}
                                                    </div>
                                                ))}

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    {bill.to.paymentType == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                                                </div>

                                                <div>Hình thức thanh toán: {bill.to.paymentType}</div>

                                                <div>
                                                    Ghi chú: {bill.to.notes}
                                                </div>

                                                <div>
                                                    Nội dung thiệp: {bill.to.cardContent}
                                                </div>

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    <b>Bên mua:</b>

                                                    <div>
                                                        {bill.customer.customerName}
                                                    </div>
                                                    <div>
                                                        {bill.customer.customerPhone}
                                                    </div>
                                                    <div>
                                                        {bill.customer.customerPlace}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    <b>Bên nhận: </b>
                                                    <div>
                                                        {bill.to.receiverName}
                                                    </div>
                                                    <div>
                                                        {bill.to.receiverPhone}
                                                    </div>
                                                    <div>
                                                        {bill.to.receiverPlace}
                                                    </div>
                                                </div>
                                            </div>


                                        </td>
                                        <td>
                                            {bill.status}
                                        </td>

                                        <td>

                                            <button className="btn btn-outline-success btn-sm"
                                                    onClick={() => this.inputUpload.click()}>
                                                <i className="fa fa-camera"/>
                                            </button>

                                            <input className="input-upload"
                                                   ref={elem => this.inputUpload = elem}
                                                   type="file"
                                                   onChange={(e) => this.handleChange(e)}
                                            />

                                            <button className="btn btn-outline-primary btn-sm"
                                                    onClick={() => history.push(`/edit-bill/${bill._id}`)}>
                                                <i className="fa fa-pencil"/>
                                            </button>

                                            <button className="btn btn-outline-dark btn-sm"
                                                    onClick={() => this.print(bill)}>
                                                <i className="fa fa-print"/>
                                            </button>

                                            {user.role == "admin" && (
                                                <button className="btn btn-outline-danger btn-sm"
                                                        onClick={() => this.remove(bill)}>
                                                    <i className="fa fa-trash"/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </Layout>
        );
    }
}