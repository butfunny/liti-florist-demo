import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {responsive} from "../../common/responsive/responsive";
import {ReportTableMobile} from "./report-table-mobile";
import moment from "moment";
import {
    filteredByKeys,
    formatNumber,
    getDates,
    getTotalBill,
    getTotalBillWithoutVAT,
    resizeImage
} from "../../common/common";
import {userInfo} from "../../security/user-info";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import sumBy from "lodash/sumBy";
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
import {getCSVData} from "./excel";
import {ReportBillModal} from "./report-bill-modal";

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
            showOwe: false,
            statusFiltered: "Tất cả",
            paymentTypeFiltered: "Tất cả"
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

    handleChange(e, bill) {
        this.setState({uploading: bill._id});
        if (e.target.files[0]) {
            resizeImage(e.target.files[0]).then((file) => {
                uploadApi.upload(file).then(resp => {
                    this.setState({uploading: false});
                    billApi.updateBillImage(bill._id, {file: resp.file}).then(() => {
                        this.setState({
                            bills: this.state.bills.map(b => b._id == bill._id ? {...b, image: resp.file} : b)
                        })
                    })
                })
            })
        }
    }

    handleChangeStatus(bill, value) {
        if (value == "Huỷ Đơn" || value == "Khiếu Nại") {
            const reasons = [{
                type: "Huỷ Đơn",
                value: [
                    "Muốn giao hoa từ sớm khoảng 6h nhưng cửa hàng không giao được.",
                    "Khách order nhưng ko qua lấy, boom cửa hàng",
                    "Khách không có nhà, người nhận không nhận hoa",
                    "Khách ko muốn nhận vì giá cao mà ít hoa",
                    "Khách đặt hoa nhầm ngày",
                    "Hoa xấu, muộn giờ",
                    "Khách cần gấp ko kịp đợi làm ",
                    "Order trước nhưng đến hôm đó ko có hoa như mẫu khách thích",
                    "Khách ok ảnh hoa nhưng ship đến KH không nhận do ảnh đẹp còn thực tế xấu",
                    "Giá cao",
                    "Khác"
                ]
            }, {
                type: "Khiếu Nại",
                value: [
                    "Chất lượng hoa",
                    "Giá thành hoa",
                    "Sai sót chủ quan từ sale",
                    "Sai sót chủ quan từ florist",
                    "Sai sót chủ quan từ Ship nội bộ",
                    "Sai sót từ ship ngoài",
                    "Sai sót từ vận hành/SM",
                    "Lỗi khách quan",
                    "Khác"
                ]
            }];

            const modal = modals.openModal({
                content: (
                    <ReportBillModal
                        type={value}
                        list={reasons.find(r => r.type == value).value}
                        onDismiss={() => modal.close()}
                        onClose={(reasons) => {
                            this.setState({bills: this.state.bills.map(b => b._id == bill._id ? {...b, status: value} : b)});
                            billApi.updateBillStatus(bill._id, {status: value, reason: reasons.join(", ")});
                            modal.close();
                        }}
                    />
                )
            })

        } else {
            this.setState({bills: this.state.bills.map(b => b._id == bill._id ? {...b, status: value} : b)});
            billApi.updateBillStatus(bill._id, {status: value});
        }


    }


    render() {

        let {bills, customers, keyword, from, to, logs, showOwe, max_day_view_report, statusFiltered, paymentTypeFiltered, loading, uploading} = this.state;
        let {history} = this.props;

        const getCustomer = (id) => customers.find(c => c._id == id) || {};

        const isMobile = responsive.le("xs");

        const formattedBills = bills ? bills.map(b => ({...b, customer: getCustomer(b.customerId), logs: logs.filter(l => l.bill_id == b._id)})) : [];

        let billsFiltered = bills ? filteredByKeys(formattedBills, ["customer.customerName","customer.customerPhone", "bill_number"], keyword) : [];

        billsFiltered = billsFiltered.filter(b => {
            if (statusFiltered != "Tất cả") return b.status == statusFiltered;
            return true;
        });

        billsFiltered = billsFiltered.filter(b => {
            if (paymentTypeFiltered != "Tất cả") return b.to.paymentType == paymentTypeFiltered;
            return true;
        });

        const user = userInfo.getUser();

        let startDay = new Date();
        startDay.setDate(startDay.getDate() - max_day_view_report);
        startDay.setHours(0, 0, 0, 0);


        const status = ["Tất cả", "Chờ xử lý", "Đang xử lý", "Chờ giao", "Done", "Khiếu Nại", "Huỷ Đơn"];
        const paymentTypes = ["Tất cả", "Nợ", "Ship", "Shop", "Thẻ", "Chuyển Khoản", "Free", "Paypal"];


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
                    <h6>
                        Khách Mới: <b className="text-primary">{bills ? bills.filter(b => b.isNewCustomer).length : 0}</b>
                    </h6>
                    <h6>
                        Tổng Thu: <b className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBill(b))) : 0}</b>
                    </h6>
                    <h6>
                        Tổng Thu chưa bao gồm VAT: <b className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBillWithoutVAT(b))) : 0}</b>
                    </h6>


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
                            <button className="btn btn-info btn-sm btn-get btn-icon"
                                    disabled={loading}
                                    onClick={() => this.getBills()}>
                                Xem Hoá Đơn

                                { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>

                    </div>


                    { bills && !loading && (
                        <CSVLink
                            data={getCSVData(billsFiltered)}
                            filename={"baocao.csv"}
                            className="btn btn-info btn-icon btn-excel btn-sm">
                            <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                            <span className="btn-inner--text">Xuất Excel</span>
                        </CSVLink>
                    )}

                    <div className="form-group">
                        <div className="control-label">
                            Trạng thái
                        </div>

                        <select
                            className="form-control"
                            value={statusFiltered} onChange={(e) => this.setState({statusFiltered: e.target.value})}>
                            {status.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="control-label">
                            Hình thức thanh toán
                        </div>

                        <select
                            className="form-control"
                            value={paymentTypeFiltered} onChange={(e) => this.setState({paymentTypeFiltered: e.target.value})}>
                            {paymentTypes.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm kiếm"
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
                                onChangeImage={(e, bill) => this.handleChange(e, bill)}
                                uploading={uploading}
                                onChangeStatus={(bill, value) => this.handleChangeStatus(bill, value)}

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
                                    <tr key={index} className={classnames(new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý" &&  "text-danger", (bill.status == "Khiếu Nại" || bill.status == "Huỷ Đơn") && "text-warning")}>
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

                                            { bill.image && (
                                                <img src={bill.image} className="bill-image" alt=""/>
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                { bill.items.map((item, index) => (
                                                    <div key={index}>
                                                        <b>{item.quantity}</b> {item.flowerType} {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>} {item.vat ? <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                                                    </div>
                                                ))}

                                                {bill.vipSaleType && (
                                                    <div>VIP: <b>{bill.vipSaleType}</b></div>
                                                )}

                                                {bill.promotion && (
                                                    <span>{bill.promotion.name}: <b>{bill.promotion.discount}%</b></span>
                                                )}

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
                                            { (bill.status == "Done" || bill.status == "Khiếu Nại" || bill.status == "Huỷ Đơn") ? (
                                                <select value={bill.status} onChange={(e) => this.handleChangeStatus(bill, e.target.value)}>
                                                    <option value="Done">Done</option>
                                                    <option value="Khiếu Nại">Khiếu Nại</option>
                                                    <option value="Huỷ Đơn">Huỷ Đơn</option>
                                                </select>
                                            ) : (
                                                <span>{bill.status}</span>
                                            )}
                                        </td>

                                        <td>

                                            <UploadBtn
                                                uploading={uploading}
                                                bill={bill}
                                                onChange={(e) => this.handleChange(e, bill)}
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

export class UploadBtn extends React.Component {

    render() {

        let {bill, onChange, uploading} = this.props;

        return (
            <Fragment>
                <button className="btn btn-outline-success btn-sm"
                        onClick={() => this.inputUpload.click()}>


                    { uploading == bill._id ? <i className="fa fa-spinner fa-pulse"/> : <i className="fa fa-camera"/>}
                </button>

                <input className="input-upload"
                       ref={elem => this.inputUpload = elem}
                       type="file"
                       onChange={(e) => onChange(e)}
                />
            </Fragment>
        )
    }
}