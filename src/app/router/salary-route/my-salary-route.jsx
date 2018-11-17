import React from "react";
import {Layout} from "../../components/layout/layout";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {billApi} from "../../api/bill-api";
import {floristApi} from "../../api/florist-api";
import {filteredByKeys, formatNumber, getSalary, getTotalBill} from "../../common/common";
import {DatePicker} from "../../components/date-picker/date-picker";
import {Input} from "../../components/input/input";
import moment from "moment";
import sortBy from "lodash/sortBy";
import {userInfo} from "../../security/user-info";
import sumBy from "lodash/sumBy"
export class MySalaryRoute extends React.Component {

    constructor(props) {
        super(props);
        let today = new Date();
        today.setDate(1);
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            from: today,
            to: endDay,
            bills: null,
            keyword: ""
        };

    }

    componentDidMount() {
        this.getBills();
    }

    getBills() {
        this.setState({loading: true});
        floristApi.getMySalary({from: this.state.from, to: this.state.to}).then((bills) => {
            this.setState({bills: bills, loading: false})
        })
    }


    render() {

        let {bills, customers, keyword, from, to, loading} = this.state;
        let billsFiltered = bills ? bills.filter(b => b.bill_number.toLowerCase().indexOf(keyword.toLowerCase()) > -1) : bills;
        const user = userInfo.getUser();

        return (
            <Layout
                activeRoute="Doanh Thu"
            >
                <div className="my-salary-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Doanh Thu</h1>
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
                                Xem Doanh Thu

                                { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>

                    </div>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm mã đơn"
                        />
                    </div>

                    <h6>Doanh thu {moment(from).format("DD/MM/YYYY")} - {moment(to).format("DD/MM/YYYY")} : <b>{formatNumber(sumBy(bills, b => getSalary(user, b).money))}</b></h6>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Mã Đơn</th>
                            <th scope="col">Thông Tin Đơn</th>
                            <th scope="col">Tiền Thu</th>
                        </tr>
                        </thead>
                        <tbody>
                        { bills && billsFiltered.map((bill, index) => (
                            <tr key={index}>
                                <td>
                                    <div>Mã đơn hàng: <b>{bill.bill_number}</b></div>
                                    {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
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
                                            <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {formatNumber(getSalary(user, bill).money)} {getSalary(user, bill).percent && <span className="text-primary">({getSalary(user, bill).percent}%)</span>}
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