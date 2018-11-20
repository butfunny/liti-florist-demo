import React from "react";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import {UploadBtn} from "./bill-order";

export class ReportTableMobile extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {

        let {bills, history, onRemove, user, onUpdateBill, onShowLog, onRemoveOwe, uploading, onChangeImage} = this.props;


        return (
            <table className="table table-hover">
                <thead>
                <tr>
                    <th scope="col">Thông Tin Đơn</th>
                    <th scope="col" style={{width: "30%"}}/>
                </tr>
                </thead>
                <tbody>
                {bills && bills.map((bill, index) => (
                    <tr key={index}>
                        <td>
                            Thời gian: <b>{moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}</b>
                            <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                            <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                            <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : bill.to.saleEmp}</b></div>
                            <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : bill.to.florist}</b></div>
                            <div className="margin-bottom">Nhân viên ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b></div>

                            <div><b>Sản phẩm: </b></div>

                            {bill.items.map((item, index) => (
                                <div key={index}>
                                    <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>} {item.vat ? <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                                </div>
                            ))}

                            {bill.vipSaleType && (
                                <div>VIP: <b>{bill.vipSaleType}</b></div>
                            )}

                            {bill.promotion && (
                                <span>{bill.promotion.name}: <b>{bill.promotion.discount}%</b></span>
                            )}

                            <div className="margin-top">
                                {bill.to.paymentType == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                            </div>
                            <div>Hình thức thanh toán: {bill.to.paymentType}</div>

                            <div>
                                Ghi chú: {bill.to.notes}
                            </div>

                            <div>
                                Nội dung thiệp: {bill.to.cardContent}
                            </div>

                            <div className="margin-top margin-bottom"><b>Trạng thái: </b></div>

                            {bill.status}

                            <div className="margin-top">
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

                            <div className="margin-top">
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


                            {bill.logs.length > 0 && (
                                <div>
                                    <span className="text-danger">(Đã chỉnh sửa)</span>
                                    <div>
                                        <span className="text-primary" style={{cursor: "pointer"}}
                                              onClick={() => onShowLog(bill.logs)}>
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

                            <UploadBtn
                                uploading={uploading}
                                bill={bill}
                                onChange={(e) => onChangeImage(e, bill)}
                            />

                            <button className="btn btn-outline-primary btn-sm"
                                    onClick={() => history.push(`/edit-bill/${bill._id}`)}>
                                <i className="fa fa-pencil"/>
                            </button>

                            {user.role == "admin" && (
                                <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => onRemove(bill)}>
                                    <i className="fa fa-trash"/>
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
}