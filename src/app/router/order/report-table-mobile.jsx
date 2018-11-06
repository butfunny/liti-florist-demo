import React from "react";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";

export class ReportTableMobile extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {

        let {bills, history, onRemove, user, onUpdateBill, onShowLog, onRemoveOwe} = this.props;

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
                            Thời gian: <b>{moment(bill.delivery_time).format("DD/MM/YYYY HH:mm")}</b>
                            <div>Mã đơn hàng: <b>{bill.bill_id}</b></div>
                            <div>Nhân viên bán: <b>{bill.created_by.username}</b></div>
                            <div>Florist: <b>{bill.florist}</b></div>
                            <div className="margin-bottom">Nhân viên ship (hoặc phí ship): <b>{bill.ship}</b></div>


                            <div><b>Sản phẩm: </b></div>

                            {bill.items.map((item, index) => (
                                <div key={index}>
                                    <b>{item.qty}</b> {item.name} {item.discount &&
                                <span className="text-primary">({item.discount}%)</span>}
                                </div>
                            ))}

                            <div className="margin-top">
                                {bill.payment_type == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill.items))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill.items))}</b></span>}
                            </div>
                            <div>Hình thức thanh toán: {bill.payment_type}</div>

                            <div>
                                Ghi chú: {bill.notes}
                            </div>

                            <div>
                                Nội dung thiệp: {bill.card}
                            </div>

                            <div className="margin-top margin-bottom"><b>Trạng thái: </b></div>

                            <select
                                className="form-control" value={bill.status}
                                onChange={(e) => onUpdateBill(bill, e.target.value)}>
                                {statuses.map((status, index) => (
                                    <option value={status.value} key={index}>{status.label}</option>
                                ))}
                            </select>

                            <div className="margin-top">
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

                            <div className="margin-top">
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


                        </td>
                        <td>
                            <button className="btn btn-outline-primary btn-sm"
                                    onClick={() => history.push(`/edit-bill/${bill._id}`)}>
                                <i className="fa fa-pencil"/>
                            </button>

                            { bill.payment_type == "Nợ" && (
                                <button className="btn btn-outline-success btn-sm"
                                        onClick={() => onRemoveOwe(bill)}>
                                    <i className="fa fa-usd"/>
                                </button>
                            )}

                            {user.isAdmin && (
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