import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber, getTotalBill} from "../../../common/common";
import moment from "moment";
export class ReportNotSuccessBill extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {bills, customers} = this.props;
        const getCustomer = (id) => customers.find(c => c._id == id) || {};
        const formattedBills = bills ? bills.map(b => ({...b, customer: getCustomer(b.customerId)})) : [];

        return (
            <table className="table table-hover">
                <thead>
                <tr>
                    <th scope="col">Thông Tin Đơn</th>
                    <th scope="col">Lí Do</th>
                </tr>
                </thead>
                <tbody>
                { sortBy(formattedBills, "created").reverse().map((bill, index) => (
                    <tr key={index}>
                        <td>
                            Thời gian: <b>{moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}</b>
                            <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                            <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : bill.to.saleEmp}</b></div>
                            <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : bill.to.florist}</b></div>
                            <div className="margin-bottom">Nhân viên ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b></div>

                            <div><b>Sản phẩm: </b></div>

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

                            { bill.image && (
                                <img src={bill.image} className="bill-image" alt=""/>
                            )}

                        </td>

                        <td>
                            {bill.reason.split(", ").map((reason, index) => (
                                <div key={index}>
                                    - {reason}
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
}