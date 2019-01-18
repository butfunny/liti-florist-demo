import React, {Fragment} from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import moment from "moment";
import {premisesAllInfo, premisesInfo} from "../../../security/premises-info";
import sumBy from "lodash/sumBy";

export class BillPrint extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let {bill} = this.props;

        let premises = premisesAllInfo.getPremises();
        const getPriceBill = (bill) => sumBy(bill.items, item => item.price * item.quantity);
        const getTotalSale = () => sumBy(bill.items, item => {
            let price = item.price * item.quantity;
            if (item.sale) {
                return price * item.sale / 100
            }

            return 0;
        });


        return (
            <div>
                <span style={{float: "right", fontSize: "14px", marginTop: "10px"}}>
                                {premisesInfo.getActivePremise().name}
                    </span>
                <div className="row" style={{marginLeft: "5px"}}>

                    <div className="col-md-6 col-xs-7">
                        <div className="row">
                            <img src="/assets/img/liti-logo.png" style={{width: "70px", height: "70px", marginLeft: "10px"}}/>
                        </div>


                        <div className="row" style={{marginTop: "5px"}}>
                            <span style={{fontSize: "10px"}}>

                                {premises.map((p, index) => (
                                    <div key={index}>
                                        Cơ sở {index + 1}: {p.address}
                                    </div>
                                ))}

                                <div>Website: litiflorist.com</div>
                                <div><b>Tel: 0435766338 | 0964263355</b></div>
                            </span>
                        </div>
                    </div>
                    <div className="col-md-6 col-xs-5">
                        <div className="row">
                            <span style={{fontSize: "14px"}}>
                                  <i>
                                      Số đơn hàng: <b>{bill.bill_number}</b>
                                      <br/>
                                      Ngày nhận hàng: <b>{moment(bill.deliverTime).format("DD/MM/YYYY")}</b>
                                      <br/>
                                      Giờ nhận hàng: <b>{moment(bill.deliverTime).format("HH:mm")}</b>
                                  </i>
                            </span>
                        </div>
                        <div className="row" style={{marginTop: "50px"}}>
                            <b style={{fontSize: "20px"}}>HOÁ ĐƠN BÁN LẺ</b>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-xs-6">
                        <span style={{fontSize: "12px"}}>
                            TÊN NGƯỜI NHẬN: <b>{bill.to.receiverName}</b>
                            <br/>
                            ĐỊA CHỈ NHẬN: <b>{bill.to.receiverPlace}</b>
                            <br/>
                            Nội dung thiệp: <b>{bill.to.cardContent}</b>
                        </span>
                    </div>
                    <div className="col-md-6 col-xs-6">
                        <span style={{fontSize: "12px"}}>
                            SĐT NGƯỜI NHẬN: <b>{bill.to.receiverPhone}</b>
                            <br/>
                            HÌNH THỨC THANH TOÁN: <b>{bill.to.paymentType}</b>
                            <br/>
                            Ghi chú: <b>{bill.to.notes}</b>
                        </span>
                    </div>
                </div>

                <table style={{border: "1px"}} className="table">
                    <thead>
                        <tr style={{fontSize: "12px"}}>
                            <th>Nội dung</th>
                            <th className="text-right">SL</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-right">KM</th>
                            <th className="text-right">VAT</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bill.items.map((item, index) => (
                            <tr key={index} style={{fontSize: "12px"}}>
                                <td>{item.type} {item.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{formatNumber(item.price)} </td>
                                <td className="text-right">{item.sale ? item.sale + '%' : 'Không'}</td>
                                <td className="text-right">{item.vat ? item.vat + '%' : '0%'}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>

                <div className="row">
                    <div className="col-md-10 col-xs-8 text-right" style={{fontSize: "12px"}}>
                        Thành tiền:
                        <br/>
                        Giảm giá:
                        <br/>
                        {bill.payOwe && (
                            <span>Thanh Toán Nợ: <br/></span>
                        )}

                        {bill.vipSaleType && (
                            <span>VIP: <br/></span>
                        )}

                        {bill.promotion && (
                            <span>{bill.promotion.name}<br/></span>
                        )}

                        {bill.to.paymentType == "Nợ" ? "Nợ" : "Tổng tiền: "}
                    </div>
                    <div className="col-md-2 col-xs-4 text-right" style={{fontSize: "12px"}}>
                        <b>{formatNumber(getPriceBill(bill))}</b>
                        <br/>
                        <b>{formatNumber(getTotalSale())}</b>
                        <br/>
                        {bill.payOwe && (
                            <b>{formatNumber(bill.customerInfo.spend.totalOwe)} <br/></b>
                        )}

                        {bill.vipSaleType && (
                            <b>{bill.vipSaleType} <br/></b>
                        )}

                        {bill.promotion && (
                            <b>{bill.promotion.discount}% <br/></b>
                        )}

                        {formatNumber(getTotalBill(bill))}
                    </div>
                </div>

                <div className="row" style={{marginTop: "10px", fontSize: "12px"}}>
                    <div className="col-md-6 col-xs-6">
                        FLORIST:
                        <br/>
                        {bill.florists && <b>{bill.florists.map(f => f.username).join(", ")}</b>}
                    </div>
                    <div className="col-md-3 col-xs-3">
                        SHIP:
                        <br/>
                        {bill.ships && <b>{bill.ships.map(f => f.username).join(", ")}</b>}
                    </div>
                    <div className="col-md-3 col-xs-3">
                        SALE:
                        <br/>
                        {bill.sales && <b>{bill.sales.map(f => f.username).join(", ")}</b>}
                    </div>
                </div>


                <div className="row" style={{marginTop: "10px", fontSize: "12px"}}>
                    <div className="col-md-6 col-xs-6">
                        Người đặt hoa:
                        <br/>
                        <b>{bill.customer.customerName}</b>
                    </div>

                    <div className="col-md-6 col-xs-6">
                        Số điện thoại người đặt:
                        <br/>
                        <b>{bill.customer.customerPhone}</b>
                    </div>

                    <div className="col-md-6 col-xs-6">
                        Người tạo đơn:
                        <br/>
                        <b>{bill.created_by}</b>
                    </div>
                </div>
            </div>
        );
    }
}