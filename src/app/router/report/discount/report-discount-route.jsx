import React from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import sumBy from "lodash/sumBy";
import {formatNumber, getStartAndLastDayOfWeek, getTotalBill, getTotalBillWithouDiscount} from "../../../common/common";
import {CSVLink} from "react-csv";
import {Select} from "../../../components/select/select";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import sortBy from "lodash/sortBy";
import {DataTable} from "../../../components/data-table/data-table";
export class ReportDiscountRoute extends React.Component {

    constructor(props) {
        super(props);
        let {from, to} = getStartAndLastDayOfWeek();

        this.state = {
            from,
            to,
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

        let csvData = [[
            "Tên chiến dịch",
            "Doanh thu trước chiết khấu",
            "Tổng chiết khấu",
            "Doanh thu sau chiết khấu"
        ]];



        for (let b of billsMapped) {
            csvData.push([
                b.name,
                sumBy(b.bills, b => getTotalBillWithouDiscount(b)),
                sumBy(b.bills, b => getTotalBillWithouDiscount(b)) - sumBy(b.bills, b => getTotalBill(b)),
                sumBy(b.bills, b => getTotalBill(b))
            ])
        }


        let columns = [{
            label: "Tên",
            display: (row) => row.name,
            width: "25%",
            minWidth: "150",
            sortBy: (row) => row.name
        }, {
            label: "Doanh thu trước CK",
            display: (b) => formatNumber(sumBy(b.bills, b => getTotalBillWithouDiscount(b))),
            width: "25%",
            minWidth: "150",
            sortBy: (b) => sumBy(b.bills, b => getTotalBillWithouDiscount(b))
        },{
            label: "Tổng CK",
            display: (b) => formatNumber(sumBy(b.bills, b => getTotalBillWithouDiscount(b)) - sumBy(b.bills, b => getTotalBill(b))),
            width: "25%",
            minWidth: "150",
            sortBy: (b) => sumBy(b.bills, b => getTotalBillWithouDiscount(b)) - sumBy(b.bills, b => getTotalBill(b))
        }, {
            label: "Doanh thu sau CK",
            display: (b) => formatNumber(sumBy(b.bills, b => getTotalBill(b))),
            width: "25%",
            minWidth: "150",
            sortBy: (b) => sumBy(b.bills, b => getTotalBill(b))
        }];



        return (
            <Layout activeRoute="Khuyến Mại">


                <div className="card bill-report-route">
                    <div className="card-title">
                        Báo cáo chiến dịch khuyến mại
                    </div>

                    <div className="card-body">
                        <div className="row first-margin"
                        >
                            <DatePicker
                                className="col"
                                label="Từ Ngày"
                                value={from}
                                onChange={(from) => {
                                    this.setState({from})
                                }}
                            />

                            <DatePicker
                                className="col"
                                label="Tới Ngày"
                                value={to}
                                onChange={(to) => {
                                    this.setState({to})
                                }}
                            />

                            <button className="btn btn-primary"
                                    onClick={() => this.getReport()}
                                    disabled={loading}
                            >
                                <span className="btn-text">Xem</span>
                                {loading &&
                                <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>

                    </div>

                    <DataTable
                        columns={columns}
                        rows={billsMapped}
                        loading={loading}
                    />

                </div>

            </Layout>
        );
    }
}