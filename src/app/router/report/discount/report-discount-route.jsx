import React from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import sumBy from "lodash/sumBy";
import {formatNumber, getTotalBill, getTotalBillWithouDiscount} from "../../../common/common";
export class ReportDiscountRoute extends React.Component {

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
            viewType: "Khách Hàng",
            customersBirth: null
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

        let {loading, from, to, bills} = this.state;

        let billsMapped = [];
        for (let bill of bills) {
            if (bill.promotion) {
                let found = billsMapped.find(b => b.name == bill.promotion.name);
                if (!found) {
                    billsMapped.push({
                        name: bill.promotion.name,
                        bills: [bill]
                    })
                } else {
                    found.bills.push(bill);
                }
            }
        }

        return (
            <Layout activeRoute="Báo Cáo">
                <div className="report-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo cáo chiến dịch khuyến mại</h1>
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

                    <div className="form-group">
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <th scope="col">Tên</th>
                                <th scope="col">Doanh thu trước CK</th>
                                <th scope="col">Tổng CK</th>
                                <th scope="col">Doanh thu sau CK</th>
                            </tr>
                            </thead>
                            <tbody>
                            {billsMapped.map((b, index) => (
                                <tr key={index}>
                                    <td>
                                        {b.name}
                                    </td>
                                    <td>
                                        {formatNumber(sumBy(b.bills, b => getTotalBillWithouDiscount(b)))}
                                    </td>
                                    <td>
                                        {formatNumber(sumBy(b.bills, b => getTotalBillWithouDiscount(b)) - sumBy(b.bills, b => getTotalBill(b)))}
                                    </td>
                                    <td>
                                        {formatNumber(sumBy(b.bills, b => getTotalBill(b)))}
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