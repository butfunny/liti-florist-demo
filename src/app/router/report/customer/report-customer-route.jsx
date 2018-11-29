import React from "react";
import {Layout} from "../../../components/layout/layout";
import {billApi} from "../../../api/bill-api";
import {DatePicker} from "../../../components/date-picker/date-picker";
import groupBy from "lodash/groupBy";
import countBy from "lodash/countBy";
import {formatNumber, getTotalBill, getTotalBillWithoutVAT, keysToArray} from "../../../common/common";
import sumBy from "lodash/sumBy";
import sortBy from "lodash/sortBy";
export class ReportCustomerRoute extends React.Component {

    constructor(props) {
        super(props);
        let date = new Date(), y = date.getFullYear(), m = date.getMonth();

        this.state = {
            from: new Date(y, m, 1),
            to: new Date(y, m + 1, 0),
            loading: true,
            bills: [],
            customers: [],
            vips: [],
            viewType: "Khách Hàng"
        };
    }

    componentDidMount() {
        this.getReport();
    }

    getReport() {
        this.setState({loading: true, bills: [], customers: [], vips: []});
        let {from, to} = this.state;
        billApi.getReportAll({from, to}).then(({bills, customers, vips, items}) => {
            this.setState({bills, customers, vips, items, loading: false})
        })
    }

    render() {

        let {loading, from, to, bills, vips} = this.state;

        let groupedBills = keysToArray(groupBy(bills, "customerId"));

        return (
            <Layout activeRoute="Báo Cáo">
                <div className="report-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo cáo khách hàng</h1>
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
                            <button className="btn btn-info btn-sm btn-get btn-icon"
                                    disabled={loading}
                                    onClick={() => this.getReport()}>
                                Xem Hoá Đơn

                                { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>
                    </div>

                    { !loading && (
                        <div className="form-group">
                            <h6>
                                Tổng số lần mua: <b className="text-primary">{bills.length}</b>
                            </h6>

                            <h6>
                                Khách mới: <b className="text-primary">{bills.filter(b => b.isNewCustomer).length}</b>
                            </h6>

                            <h6>
                                Khách làm thẻ VIP: <b className="text-primary">
                                {vips.filter(v => new Date(v.created).getTime() > from.getTime() && new Date(v.created).getTime() < to.getTime()).length}
                            </b>
                            </h6>

                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th scope="col">Số lần mua hàng</th>
                                    <th scope="col">Số khách</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>0 - 2</td>
                                    <td>{groupedBills.filter(b => b.value.length <= 2).length}</td>
                                </tr>

                                <tr>
                                    <td>3 - 6</td>
                                    <td>{groupedBills.filter(b => b.value.length <= 6 && b.value.length >= 3).length}</td>
                                </tr>

                                <tr>
                                    <td>7 - 10</td>
                                    <td>{groupedBills.filter(b => b.value.length <= 10 && b.value.length >= 7).length}</td>
                                </tr>

                                <tr>
                                    <td>11 - 12</td>
                                    <td>{groupedBills.filter(b => b.value.length <= 11 && b.value.length >= 12).length}</td>
                                </tr>

                                <tr>
                                    <td>13+</td>
                                    <td>{groupedBills.filter(b => b.value.length >= 13).length}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </Layout>
        );
    }
}