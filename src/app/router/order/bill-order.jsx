import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
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
import {paymentTypes} from "../../common/constance";
import {Select} from "../../components/select/select";
import {SelectTags} from "../../components/select-tags/select-tags";
import {security} from "../../security/secuiry-fe";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ButtonGroup} from "../../components/button-group/button-group";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {DataTable} from "../../components/data-table/data-table";
import {MoveBillModal} from "./move-bill-modal";

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
            statusFiltered: [],
            paymentTypeFiltered: []
        };

        premisesInfo.onChange(() => {
            this.getBills();
        });

        this.getBills();

    }

    getBills() {

        this.setState({loading: true});
        billApi.getBills(premisesInfo.getActivePremise()._id, {
            from: this.state.from,
            to: this.state.to
        }).then(({bills, customers, logs}) => {
            this.setState({
                bills: bills.map(bill => {
                    return {
                        ...bill,
                        lastTime: new Date(bill.delivery_time).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.delivery_time).getTime() - new Date().getTime()) : new Date(bill.delivery_time).getTime() - new Date().getTime()
                    }
                }), customers, logs, loading: false
            })
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
                reason: "Xoá nợ.",
                update_time: new Date(),
                isOwe: false
            }).then(() => {
                this.getBills();
            })
        })
    }

    moveBill(bill) {
        const modal = modals.openModal({
            content: (
                <MoveBillModal
                    billID={bill._id}
                    onClose={() => {
                        this.getBills();
                        modal.close();
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    handleChange(e, bill) {
        if (e.target.files[0]) {
            resizeImage(e.target.files[0]).then((file) => {
                this.setState({uploading: bill._id});
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
                            this.setState({
                                bills: this.state.bills.map(b => b._id == bill._id ? {
                                    ...b,
                                    status: value
                                } : b)
                            });
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

        const formattedBills = bills ? bills.map(b => ({
            ...b,
            customer: getCustomer(b.customerId),
            logs: logs.filter(l => l.bill_id == b._id)
        })) : [];
        const status = ["Chờ xử lý", "Đang xử lý", "Chờ giao", "Done", "Khiếu Nại", "Huỷ Đơn"];

        let billsFiltered = bills ? filteredByKeys(formattedBills, ["customer.customerName", "customer.customerPhone", "bill_number"], keyword) : [];
        billsFiltered = billsFiltered.filter(i => {

            if (showOwe) {
                return i.isOwe
            }

            const filterStatus = (i) => {
                if (statusFiltered.length == 0) return true;

                for (let s of statusFiltered) {
                    if (i.status == s) return true;
                }
                return false;
            };


            const filterType = (i) => {
                if (paymentTypeFiltered.length == 0) return true;
                for (let type of paymentTypeFiltered) {
                    if (i.to.paymentType == type) return true;
                }
            };

            return filterType(i) && filterStatus(i);
        });


        const user = userInfo.getUser();

        let startDay = new Date();
        startDay.setDate(startDay.getDate() - max_day_view_report);
        startDay.setHours(0, 0, 0, 0);


        const permission = permissionInfo.getPermission();

        const isCanEditBill = (bill) => {
            if (["Chờ xử lý", "Đang xử lý", "Chờ giao"].indexOf(bill.status) > -1) {
                return security.isHavePermission(["bill.edit"])
            }
            return security.isHavePermission(["bill.editDoneBill"])
        };


        let columns = [{
            label: "Thời gian",
            display: (bill) => (
                <Fragment>
                    {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
                    <div><b>{bill.bill_number}</b></div>
                    <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : (bill.to || {}).saleEmp}</b>
                    </div>
                    <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : (bill.to || {}).florist}</b>
                    </div>
                    <div>Ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b>
                    </div>

                    {bill.logs.length > 0 && (
                        <div>
                            <span className="text-danger">(Đã chỉnh sửa)</span>
                            <div>
                                <span className="text-primary" style={{cursor: "pointer"}}
                                      onClick={() => this.showLog(bill.logs)}>
                                    Chi tiết
                                </span>
                            </div>
                        </div>
                    )}

                    {bill.image && (
                        <ImgPreview src={bill.image} className="bill-image" alt=""/>
                    )}
                </Fragment>
            ),
            width: "20%",
            minWidth: "150",
            sortBy: (bill) => bill.deliverTime
        }, {
            label: "Thông tin đơn",
            display: (bill) => (
                <div>
                    {bill.items.map((item, index) => (
                        <div key={index}>
                            <b>{item.quantity}</b> {item.flowerType} {item.name} {item.sale &&
                        <span className="text-primary">({item.sale}%)</span>} {item.vat ?
                            <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                            {item.color && (
                                <div className="text-small">Màu: {item.color.split(", ").map((c, i) => (
                                    <div key={i}
                                         style={{
                                             background: c,
                                             display: "inline-block",
                                             marginRight: "5px",
                                             width: "15px",
                                             height: "10px"
                                         }}
                                    />
                                ))}</div>)}
                            {item.size && (<div className="text-small">Size: <b>{item.size}</b></div>)}
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
                        {bill.isOwe ?
                            <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> :
                            <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                    </div>

                    <div>Hình thức thanh toán: {bill.to.paymentType} { bill.to.paymentType == "Nợ" && !bill.isOwe && <span className="text-success">(Đã trả nợ)</span>}</div>

                    <div>
                        Ghi chú: {bill.to.notes}
                    </div>

                    <div>
                        Nội dung thiệp: {bill.to.cardContent}
                    </div>
                </div>
            ),
            width: "30%",
            minWidth: "250"
        }, {
            label: "Thông tin khách",
            display: (bill) => (
                <Fragment>
                    <div>
                        Bên mua:

                        <b>
                            <div>
                                {bill.customer.customerName}
                            </div>
                            <div>
                                {bill.customer.customerPhone}
                            </div>
                            <div>
                                {bill.customer.customerPlace}
                            </div>
                        </b>
                    </div>

                    <div style={{marginTop: "10px"}}>
                        Bên nhận:
                        <b>
                            <div>
                                {bill.to.receiverName}
                            </div>
                            <div>
                                {bill.to.receiverPhone}
                            </div>
                            <div>
                                {bill.to.receiverPlace}
                            </div>
                        </b>
                    </div>
                </Fragment>
            ),
            width: "30%",
            minWidth: "250"
        }, {
            label: "Trạng Thái",
            width: "15%",
            minWidth: "100",
            display: (bill) => bill.status
        }, {
            label: "",
            width: "5%",
            minWidth: "50",
            display: (bill) => (
                <ButtonGroup
                    actions={[{
                        name: "Thêm Ảnh",
                        icon: <i className="fa fa-camera "/>,
                        type: "upload",
                        onUpload: (e) => this.handleChange(e, bill)
                    }, {
                        name: "Sửa",
                        icon: <i className="fa fa-pencil "/>,
                        hide: () => !isCanEditBill(bill),
                        click: () => history.push(`/edit-bill/${bill._id}`)
                    }, {
                        name: "In",
                        icon: <i className="fa fa-print "/>,
                        click: () => this.print(bill)
                    }, {
                        name: "Chuyển Đơn",
                        icon: <i className="fa fa-share "/>,
                        click: () => this.moveBill(bill)
                    }, {
                        name: "Xóa Nợ",
                        icon: <i className="fa fa-pencil "/>,
                        hide: () => !bill.isOwe,
                        click: () => this.removeOwe(bill)
                    }, {
                        name: "Khiếu Nại",
                        icon: <i className="fa fa-flag text-danger"/>,
                        click: () => this.handleChangeStatus(bill, "Khiếu Nại"),
                        hide: () => bill.status != "Done"
                    }, {
                        name: "Hủy Đơn",
                        icon: <i className="fa fa-flag text-danger"/>,
                        click: () => this.handleChangeStatus(bill, "Huỷ Đơn"),
                        hide: () => bill.status != "Done"
                    }, {
                        name: `Xóa ${bill.status}`,
                        icon: <i className="fa fa-eraser text-success"/>,
                        click: () => this.handleChangeStatus(bill, "Done"),
                        hide: () => ["Khiếu Nại", "Huỷ Đơn"].indexOf(bill.status) == -1
                    }, {
                        name: "Xóa Đơn",
                        icon: <i className="fa fa-trash text-danger"/>,
                        click: () => this.remove(bill),
                        hide: () => !security.isHavePermission(["bill.delete"])
                    }]}
                />
            )
        }];


        return (
            <Layout
                activeRoute="Đơn Chính"
            >
                <div className="bill-report-route">

                    <div className="card">
                        <div className="card-title">
                            Lọc
                        </div>

                        <div className="card-body">
                            <div className="row first-margin"
                            >
                                <DatePicker
                                    className="col"
                                    label="Từ Ngày"
                                    value={from}
                                    onChange={(from) => {
                                        this.setState({from})
                                    }}
                                />

                                <DatePicker
                                    className="col"
                                    label="Tới Ngày"
                                    value={to}
                                    onChange={(to) => {
                                        this.setState({to})
                                    }}
                                />

                                <button className="btn btn-primary"
                                        onClick={() => this.getBills()}
                                        disabled={loading}
                                >
                                    <span className="btn-text">Lọc</span>
                                    {loading &&
                                    <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="card">
                        <div className="card-title">
                            Đơn Hàng

                            <span className="text-small text-primary">{bills ? bills.length : 0} Đơn</span>

                            {bills && !loading && permission[user.role].indexOf("bill.excel") > -1 && (
                                <CSVLink
                                    data={getCSVData(billsFiltered)}
                                    filename={"baocao.csv"}
                                    className="btn btn-primary btn-small">
                                    <span className="btn-text">Xuất Excel</span>
                                    <span className="loading-icon"><i className="fa fa-file-excel-o"/></span>
                                </CSVLink>
                            )}

                            <div className="text-info margin-top">
                                Khách Mới: <b
                                className="text-primary">{bills ? bills.filter(b => b.isNewCustomer).length : 0}</b>
                            </div>

                            <div className="text-info">
                                Tổng Cộng: <b
                                className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBill(b))) : 0}</b>
                            </div>

                            <div className="text-info text-danger">
                                Đơn Nợ: <b
                                className="text-danger">{bills ? bills.filter(b => b.isOwe).length : 0}</b>
                            </div>

                            <div className="text-info">
                                Tổng Thu: <b
                                className="text-primary">{bills ? formatNumber(sumBy(bills, b => (b.status != "Done" || b.isOwe) ? 0 : getTotalBill(b))) : 0}</b>
                            </div>

                            <div className="text-info">
                                Tổng Thu chưa bao gồm VAT: <b
                                className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBillWithoutVAT(b))) : 0}</b>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="row-filter first-margin">
                                <SelectTags
                                    className="col"
                                    tags={statusFiltered}
                                    onChange={(statusFiltered) => this.setState({statusFiltered})}
                                    list={status}
                                    label="Trạng Thái"
                                />

                                <SelectTags
                                    className="col"
                                    tags={paymentTypeFiltered}
                                    onChange={(paymentTypeFiltered) => this.setState({paymentTypeFiltered})}
                                    list={paymentTypes.slice(1)}
                                    label="Hình Thức Thanh Toán"
                                />
                            </div>

                            <Input
                                label="Tìm kiếm"
                                value={keyword}
                                onChange={(e) => this.setState({keyword: e.target.value})}
                            />

                            <Checkbox
                                value={showOwe}
                                onChange={(showOwe) => this.setState({showOwe})}
                                label="Lọc Nợ"
                            />
                        </div>

                        <DataTable
                            loading={loading}
                            rows={billsFiltered}
                            columns={columns}
                            rowStyling={(bill) => {
                                if (new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý") return {background: "rgba(253,57,122, .1)"};
                                if (bill.status == "Khiếu Nại" || bill.status == "Huỷ Đơn") return {background: "rgba(255,184,34, .1)"};
                                if (bill.status == "Done") return {background: "rgb(29,201,183, .1)"}
                            }}
                        />
                    </div>

                </div>
            </Layout>
        );
    }
}
