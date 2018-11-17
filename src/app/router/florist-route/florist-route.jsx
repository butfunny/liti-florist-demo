import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {floristApi} from "../../api/florist-api";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import classnames from "classnames";
import {userInfo} from "../../security/user-info";
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
                        lastTime: new Date(bill.deliverTime).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.deliverTime).getTime() - new Date().getTime()) : new Date(bill.deliverTime).getTime() - new Date().getTime()
                    }
                })
            })
        })
    }

    render() {

        let {from, to, loading, bills} = this.state;
        let {history} = this.props;

        const user = userInfo.getUser();

        return (
            <Layout
                activeRoute="Đơn Hàng">
                <div className="florist-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Đơn Hàng</h1>
                    </div>

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
                            <button className="btn btn-primary btn-sm btn-get btn-icon"
                                    disabled={loading}
                                    onClick={() => this.getBills()}>
                                Xem Đơn

                                {loading &&
                                <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>
                    </div>


                    <div className="report-body">
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <th scope="col">Thông Tin Đơn</th>
                                <th scope="col">Làm Đơn</th>
                            </tr>
                            </thead>
                            <tbody>
                            { bills && sortBy(bills, "lastTime").map((bill, index) => (
                                <tr key={index} className={classnames(new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý" &&  "text-danger")}>
                                    <td>
                                        {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
                                        <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                                        <div>Nhân viên bán: <b>{bill.sales && <b>{bill.sales.map(f => f.username).join(", ")}</b>}</b></div>
                                        <div>Florist: <b>{bill.florists && <b>{bill.florists.map(f => f.username).join(", ")}</b>}</b></div>
                                        <div>Nhân viên ship: <b>{bill.ships && <b>{bill.ships.map(f => f.username).join(", ")}</b>}</b></div>

                                        <div>-------</div>
                                        Sản phẩm:

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
                                        { bill.florists && bill.florists[0].user_id == user._id && bill.status == "Chờ xử lý" && (
                                            <button className="btn btn-outline-primary btn-sm"
                                                    onClick={() => history.push(`/florist-working/${bill._id}`)}>
                                                <i className="fa fa-hand-lizard-o" aria-hidden="true"/>
                                            </button>
                                        )}

                                        { bill.florists && bill.florists[0].user_id == user._id && bill.status != "Chờ xử lý" && (
                                            <span>Done</span>
                                        )}
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