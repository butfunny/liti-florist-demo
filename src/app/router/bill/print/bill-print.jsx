import React, {Fragment} from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import moment from "moment";
import {premisesApi} from "../../../api/premises-api";
import {premisesAllInfo} from "../../../security/premises-info";
export class BillPrint extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let {bill} = this.props;

        let premises = premisesAllInfo.getPremises();



        return (
            <div className="bill-print"
                style={{padding: "5px"}}
            >
                <div className="information-header">
                    <img src="/assets/img/logo.jpg"
                         style={{
                             width: "80px"
                         }}
                         alt=""/>

                    { premises.map((pre, index) => (
                        <Fragment key={index}>
                            <div style={{
                                fontWeight: 300,
                                fontSize: "13px",
                                marginTop: "10px"
                            }}>
                                Cơ sở {index + 1}: {pre.name}
                                <div>{pre.address} {pre.phone && <span>- {pre.phone}</span>}</div>
                            </div>
                        </Fragment>
                    ))}


                </div>

                <div className="bill-title"
                    style={{
                        fontSize: "20px",
                        marginTop: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Đơn Đặt Hàng
                </div>

                <div className="bill-info row"
                    style={{
                        display: "flex",
                        marginTop: "15px"
                    }}
                >
                    <div className="col-md-4"
                        style={{
                            flex: "1 33.33%"
                        }}
                    >
                        <b>Ngày đặt hàng</b>
                        <div>
                            {moment(bill.created).format("DD/MM/YYYY")}
                        </div>
                    </div>

                    <div className="col-md-4"
                         style={{
                             flex: "1 33.33%"
                         }}
                    >
                        <b>Hoá đơn</b>
                        <div>
                            #{bill.bill_id}
                        </div>
                    </div>

                    <div className="col-md-4"
                         style={{
                             flex: "1 33.33%"
                         }}
                    >
                        { bill.florist && <span><b>Florist</b>: {bill.florist}</span>}
                        <div>
                            <b>Sale</b>: {bill.created_by.username}
                        </div>
                    </div>
                </div>

                <div className="bill-info row"
                     style={{
                         display: "flex",
                         marginTop: "15px",
                         marginBottom: "15px"
                     }}
                >
                    <div className="col-md-4"
                         style={{
                             flex: "1 33.33%"
                         }}
                    >
                        <b>Ngày giao hàng</b>
                        <div>
                            {moment(bill.delivery_time).format("DD/MM/YYYY")}
                        </div>
                    </div>

                    <div className="col-md-4"
                         style={{
                             flex: "1 33.33%"
                         }}
                    >
                        <b>Giờ khách nhận</b>
                        <div>
                            {moment(bill.delivery_time).format("HH:mm")}
                        </div>
                    </div>

                    <div className="col-md-4"
                         style={{
                             flex: "1 33.33%"
                         }}
                    >
                        <b>Hình thức thanh toán</b>
                        <div>
                            {bill.payment_type}
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="bill-info row"
                     style={{
                         display: "flex",
                         marginTop: "15px",
                         marginBottom: "15px"
                     }}
                >
                    <div className="col-md-4"
                         style={{
                             flex: "1 50%",
                             lineHeight: "22px"
                         }}
                    >
                        <b>Bên đặt hàng</b>

                        <div className="bill-info-line">
                            Họ Tên: {bill.customer.name}
                        </div>

                        <div className="bill-info-line">
                            Địa chỉ: {bill.customer.address}
                        </div>

                        <div className="bill-info-line">
                            SĐT: {bill.customer.phone}
                        </div>

                        <div className="bill-info-line">
                            Ghi chú: {bill.notes}
                        </div>

                        <div className="bill-info-line">
                            Nội dung thiệp: {bill.card}
                        </div>
                    </div>


                    <div className="col-md-4"
                         style={{
                             flex: "1 50%",
                             lineHeight: "22px"
                         }}
                    >
                        <b>Bên nhận hàng</b>

                        <div className="bill-info-line">
                            Họ Tên: {bill.receiver_name}
                        </div>

                        <div className="bill-info-line">
                            Địa chỉ nhận: {bill.receiver_place}
                        </div>

                        <div className="bill-info-line">
                            SĐT: {bill.receiver_phone}
                        </div>

                        <div className="bill-info-line">
                            Nhân viên ship:
                        </div>
                    </div>
                </div>

                <div className="bill-items">
                    <table className="table" style={{
                        width: "100%"
                    }}>
                        <thead>
                            <tr>
                                <th style={{
                                    textAlign: "left",
                                    borderBottom: "1px solid #dedede",
                                    fontSize: "17px",
                                    paddingBottom: "10px",
                                    width: "20%"
                                }}>Tên</th>
                                <th className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        fontSize: "17px",
                                        paddingBottom: "10px",
                                        width: "20%"
                                    }}
                                >Số Lượng</th>
                                <th className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        fontSize: "17px",
                                        paddingBottom: "10px",
                                        width: "20%"
                                    }}
                                >Đơn Giá</th>
                                <th className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        fontSize: "17px",
                                        paddingBottom: "10px",
                                        width: "20%"
                                    }}
                                >Giảm Giá</th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        fontSize: "17px",
                                        paddingBottom: "10px",
                                        width: "20%"
                                    }}
                                >Tổng giá</th>
                            </tr>
                        </thead>
                        <tbody>

                        { bill.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{
                                    textAlign: "left",
                                    borderBottom: "1px solid #dedede",
                                    paddingTop: "5px",
                                    paddingBottom: "5px",
                                    width: "20%"
                                }}>
                                    {item.name}
                                </td>

                                <td className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        width: "20%"
                                    }}
                                >
                                    {item.qty}
                                </td>

                                <td className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        width: "20%"
                                    }}
                                >{formatNumber(item.price)}</td>

                                <td className="text-right"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        width: "20%"
                                    }}
                                >
                                    {item.discount || 0}%
                                </td>

                                <td className="no-padding"
                                    style={{
                                        textAlign: "right",
                                        borderBottom: "1px solid #dedede",
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        width: "15%"
                                    }}
                                >
                                    {formatNumber(item.qty * item.price - (item.qty * item.price * (item.discount || 0) / 100))}
                                </td>
                            </tr>
                        ))}

                        </tbody>

                    </table>

                    <div className="text-right"
                         style={{
                             textAlign: "right",
                             marginTop: "10px"
                         }}
                    >
                        Tổng Phụ: <b>{formatNumber(getTotalBill(bill.items))}</b>
                    </div>
                </div>
            </div>
        );
    }
}