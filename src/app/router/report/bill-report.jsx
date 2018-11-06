import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {responsive} from "../../common/responsive/responsive";
import {ReportTableMobile} from "./report-table-mobile";
import moment from "moment";
import {filteredByKeys, formatNumber, getDates, getTotalBill} from "../../common/common";
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

export class BillReportRoute extends RComponent {

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
            showOwe: false,
            max_day_view_report: 0,
            selectedDate: today
        };

        premisesInfo.onChange(() => {
            this.getBills();
        });

        this.getBills();

        configApi.get().then((config) => {
            this.setState({max_day_view_report: config.max_day_view_report});
        })

    }

    getBills() {

        let premises = premisesInfo.getPremises();
        this.setState({loading: true});

        const getCurrentPremise = () => {
            const activeID = cache.get("active-premises");
            if (!activeID) {
                cache.set(premises[0]._id, "active-premises");
                return premises[0]._id;
            }
            const found = premises.find(p => p._id == activeID);
            if (found) return found._id;
            else {
                cache.set(premises[0]._id, "active-premises");
                return premises[0]._id
            }
        };

        billApi.getBills(getCurrentPremise(), {from: this.state.from, to: this.state.to}).then(({bills, customers, logs}) => {
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

    render() {

        let {bills, customers, keyword, from, to, logs, showOwe, max_day_view_report, selectedDate, loading} = this.state;
        let {history} = this.props;

        const getCustomer = (id) => customers.find(c => c._id == id) || {};

        const isMobile = responsive.le("xs");

        const statuses = [{
            value: "pending",
            label: "Chờ xử lý"
        }, {
            value: "processing",
            label: "Đang xử lý"
        }, {
            value: "wait",
            label: "Chờ giao"
        }, {
            value: "done",
            label: "Done"
        }];



        const totalOwe = bills ? sum(bills.filter(b => b.payment_type == "Nợ").map(b => getTotalBill(b.items))) : 0

        const total = bills ? sum(bills.map(b => getTotalBill(b.items))) : 0;

        const formattedBills = bills ? bills.map(b => ({...b, customer: getCustomer(b.customer_id), logs: logs.filter(l => l.bill_id == b._id)})) : [];

        let billsFiltered = bills ? filteredByKeys(formattedBills, ["customer.name","customer.phone","customer.address", "bill_id", "created_by.username", "florist", "ship", "receiver_name", "receiver_phone", "receiver_place", "card", "notes"], keyword) : bills;

        if (showOwe) billsFiltered = billsFiltered.filter(b => b.payment_type == "Nợ");

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
                ret += `${item.qty} ${item.name} ${item.discount ? `(${item.discount}%)` : ''}\n`
            }
            return ret;
        };

        if (bills) {
            for (let bill of billsFiltered) {
                let ret = [];
                ret.push(bill.bill_id);
                ret.push(moment(bill.created).format("DD/MM/YYYY"));
                ret.push(moment(bill.delivery_time).format("DD/MM/YYYY"));
                ret.push(moment(bill.delivery_time).format("HH:mm"));
                ret.push(bill.created_by.username);
                ret.push(bill.florist);
                ret.push(bill.payment_type);
                ret.push(bill.customer.name);
                ret.push(bill.customer.address);
                ret.push(bill.customer.phone);
                ret.push(bill.receiver_name);
                ret.push(bill.receiver_place);
                ret.push(bill.receiver_phone);
                ret.push(bill.ship);
                ret.push(bill.notes);
                ret.push(bill.card);
                ret.push(generateBillItemsText(bill.items));
                ret.push(getTotalBill(bill.items));

                csvData.push(ret);
            }
        }

        const user = userInfo.getUser();

        let startDay = new Date();
        startDay.setDate(startDay.getDate() - max_day_view_report);
        startDay.setHours(0, 0, 0, 0);

        const dates = getDates(startDay, new Date());

        return (
            <Layout
                activeRoute="Báo Cáo"
            >
                <div className="bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo Cáo</h1>
                    </div>


                    <h6>
                        Tổng thu: <b className="text-primary">{formatNumber(total - totalOwe)}</b>
                    </h6>
                    <h6>Tổng nợ: <b className="text-danger">{formatNumber(totalOwe)}</b></h6>

                    <h5>
                        Tổng tiền: <b className="text-primary">{formatNumber(total)}</b>
                    </h5>


                    <div className="report-header row">
                        <div className="col-md-6 row">
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
                                        <th scope="col">Thời gian</th>
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
                                    <tr key={index}>
                                        <td>
                                            {moment(bill.delivery_time).format("DD/MM/YYYY HH:mm")}
                                            <div>Mã đơn hàng: <b>{bill.bill_id}</b></div>
                                            <div>Nhân viên bán: <b>{bill.created_by.username}</b></div>
                                            <div>Florist: <b>{bill.florist}</b></div>
                                            <div>Nhân viên ship (hoặc phí ship): <b>{bill.ship}</b></div>

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
                                                        <b>{item.qty}</b> {item.name} {item.discount && <span className="text-primary">({item.discount}%)</span>}
                                                    </div>
                                                ))}

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    {bill.payment_type == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill.items))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill.items))}</b></span>}
                                                </div>

                                                <div>Hình thức thanh toán: {bill.payment_type}</div>

                                                <div>
                                                    Ghi chú: {bill.notes}
                                                </div>

                                                <div>
                                                    Nội dung thiệp: {bill.card}
                                                </div>

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    <b>Bên mua:</b>

                                                    <div>
                                                        {bill.customer.name}
                                                    </div>
                                                    <div>
                                                        {bill.customer.phone}
                                                    </div>
                                                    <div>
                                                        {bill.customer.address}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    marginTop: "10px"
                                                }}>
                                                    <b>Bên nhận: </b>
                                                    <div>
                                                        {bill.receiver_name}
                                                    </div>
                                                    <div>
                                                        {bill.receiver_phone}
                                                    </div>
                                                    <div>
                                                        {bill.receiver_place}
                                                    </div>
                                                </div>
                                            </div>


                                        </td>
                                        <td>
                                            <select className="form-control" value={bill.status}
                                                    onChange={(e) => this.updateBill(bill, e.target.value)}>
                                                { statuses.map((status, index) => (
                                                    <option value={status.value} key={index}>{status.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <button className="btn btn-outline-primary btn-sm"
                                                    onClick={() => history.push(`/edit-bill/${bill._id}`)}>
                                                <i className="fa fa-pencil"/>
                                            </button>

                                            <button className="btn btn-outline-dark btn-sm"
                                                    onClick={() => this.print(bill)}>
                                                <i className="fa fa-print"/>
                                            </button>

                                            { bill.payment_type == "Nợ" && (
                                                <button className="btn btn-outline-success btn-sm"
                                                        onClick={() => this.removeOwe(bill)}>
                                                    <i className="fa fa-usd"/>
                                                </button>
                                            )}

                                            {user.isAdmin && (
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