import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {floristApi} from "../../api/florist-api";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";

export class FloristRoute extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            bills: [],
            from: today,
            to: endDay,
            loading: false
        };

        this.getBills();
    }

    getBills() {
        let {from, to} = this.state;
        floristApi.getBills({from, to}).then((bills) => {
            this.setState({
                bills: bills.map(bill => {
                    return {
                        ...bill,
                        lastTime: new Date(bill.delivery_time).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.delivery_time).getTime() - new Date().getTime()) : new Date(bill.delivery_time).getTime() - new Date().getTime()
                    }
                })
            })
        })
    }

    render() {

        let {from, to, loading, bills} = this.state;

        console.log(bills);

        return (
            <Layout
                activeRoute="Đơn Hàng">
                <div className="florist-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Đơn Hàng Của Tôi</h1>
                    </div>

                    <div className="report-header row">
                        <div className="col-md-6 col-xs-12 row">
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
                                    Xem Đơn

                                    {loading &&
                                    <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="report-body">
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <th scope="col">Thời gian</th>
                                <th scope="col">Thông Tin Đơn</th>
                                <th scope="col" style={{width: "150px"}}>Tình trạng</th>
                                <th style={{width: "200px"}} scope="col">Làm Đơn</th>
                            </tr>
                            </thead>
                            <tbody>
                            { bills && sortBy(bills, "lastTime").map((bill, index) => (
                                <tr key={index}>
                                    <td>
                                        {moment(bill.delivery_time).format("DD/MM/YYYY HH:mm")}
                                        <div>Mã đơn hàng: <b>{bill.bill_id}</b></div>
                                        <div>Nhân viên bán: <b>{bill.sales && <b>{bill.sales.map(f => f.username).join(", ")}</b>}</b></div>
                                        <div>Florist: <b>{bill.florists && <b>{bill.florists.map(f => f.username).join(", ")}</b>}</b></div>
                                        <div>Nhân viên ship (hoặc phí ship): <b>{bill.ships && <b>{bill.ships.map(f => f.username).join(", ")}</b>}</b></div>
                                    </td>
                                    <td>
                                        <div>
                                            { bill.items.map((item, index) => (
                                                <div key={index}>
                                                    <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>}
                                                </div>
                                            ))}

                                            <div style={{
                                                marginTop: "10px"
                                            }}>
                                                {bill.payment_type == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                                            </div>


                                            <div>
                                                Ghi chú: {bill.to.notes}
                                            </div>

                                            <div>
                                                Nội dung thiệp: {bill.to.cardContent}
                                            </div>

                                        </div>


                                    </td>
                                    <td>
                                        {bill.status}
                                    </td>

                                    <td>
                                        <button className="btn btn-outline-primary btn-sm"
                                                onClick={() => history.push(`/edit-bill/${bill._id}`)}>
                                            <i className="fa fa-hand-lizard-o" aria-hidden="true"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    }
}