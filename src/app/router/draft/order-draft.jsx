import React from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import sortBy from "lodash/sortBy";
import classnames from "classnames";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import {UploadBtn} from "../order/bill-order";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
export class OrderDraft extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bills: null
        };

        billApi.getBillDraftList().then((bills) => {
            this.setState({bills})
        })
    }

    remove(bill) {
        let {bills} = this.state;

        confirmModal.show({
            title: "Bạn muốn xoá hoá đơn này chứ?",
            description: "Sau khi xoá mọi dữ liệu về hoá đơn sẽ biến mất."
        }).then(() => {
            this.setState({bills: bills.filter(b => b._id != bill._id)});
            billApi.removeBillDraft(bill._id);
        });

    }

    render() {

        let {bills} = this.state;

        return (
            <Layout activeRoute="Đơn Hàng">
                <div className="order-draft">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Đơn Sẵn</h1>
                    </div>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col"
                                style={{width: "200px"}}
                            >Thời gian</th>
                            <th scope="col">Thông Tin Đơn</th>
                            <th
                                style={{width: "200px"}}
                                scope="col"/>
                        </tr>
                        </thead>
                        <tbody>
                        { bills && bills.map((bill, index) => (
                            <tr key={index}>
                                <td>
                                    {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
                                    <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : (bill.to || {}).saleEmp}</b></div>
                                    <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : (bill.to || {}).florist}</b></div>
                                    <div>Nhân viên ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b></div>

                                </td>
                                <td>
                                    <div>
                                        { bill.items.map((item, index) => (
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
                                    </div>


                                </td>

                                <td>

                                    <button className="btn btn-outline-primary btn-sm"
                                            onClick={() => history.push(`/edit-bill-draft/${bill._id}`)}>
                                        <i className="fa fa-pencil"/>
                                    </button>

                                    <button className="btn btn-outline-danger btn-sm"
                                            onClick={() => this.remove(bill)}>
                                        <i className="fa fa-trash"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Layout>
        );
    }
}