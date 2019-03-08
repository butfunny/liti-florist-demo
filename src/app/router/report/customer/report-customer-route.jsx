import React from "react";
import {Layout} from "../../../components/layout/layout";
import {billApi} from "../../../api/bill-api";
import {DatePicker} from "../../../components/date-picker/date-picker";
import groupBy from "lodash/groupBy";
import countBy from "lodash/countBy";
import {
    formatNumber, getBillProfit,
    getStartAndLastDayOfWeek,
    getTotalBill,
    getTotalBillWithoutVAT,
    keysToArray
} from "../../../common/common";
import sumBy from "lodash/sumBy";
import sortBy from "lodash/sortBy";
import {customerApi} from "../../../api/customer-api";
import moment from "moment";
import {ReportBillItem} from "../bill/report-bill-item";
import {productApi} from "../../../api/product-api";
import {userInfo} from "../../../security/user-info";
import {permissionInfo} from "../../../security/premises-info";
import {CSVLink} from "react-csv";
import {Select} from "../../../components/select/select";
import {RevenueReportBill} from "../revenue/revenue-report-bill";
import {ReportEmployee} from "../revenue/report-employee";
import {ReportCustomerBuyCount} from "./report-customer-buy-count";
import {ReportCustomerType} from "./report-customer-type";
import {ReportCustomerColor} from "./report-customer-color";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import {DataTable} from "../../../components/data-table/data-table";
import {ReportCustomerSpend} from "./report-customer-spend";
import {defaultReportDayService} from "../../app-router";
export class ReportCustomerRoute extends React.Component {

    constructor(props) {

        super(props);

        let {from, to} = defaultReportDayService.get();

        this.state = {
            from,
            to,
            loading: true,
            bills: [],
            customers: [],
            vips: [],
            viewType: "Chi Tiêu",
            customersBirth: null
        };

        productApi.getTypes().then((types) => {
            this.setState({types: types.map(t => t.name)})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: colors.map(t => t.name)})
        });

        customerApi.getCustomerBirthDate().then((customersBirth) => {
            this.setState({customersBirth})
        })
    }

    componentDidMount() {
        this.getReport();
    }

    getReport() {
        this.setState({loading: true});
        let {from, to} = this.state;
        billApi.getReportAll({from, to}).then(({bills, customers, vips, items}) => {
            this.setState({bills, customers, vips, items, loading: false})
        })
    }

    render() {

        let {loading, from, to, bills, vips, customersBirth, types, colors, viewType, customers} = this.state;

        let groupedBills = keysToArray(groupBy(bills, "customerId"));


        let csvData = [[
            "Số lần mua hàng",
            "Số khách"
        ]];

        const groups = [
            {label: "0 -> 1", logic: (b) => b.value.length <= 1},
            {label: "2 -> 4", logic: (b) => b.value.length <= 4 && b.value.length >= 2},
            {label: "5 -> 10", logic: (b) => b.value.length <= 10 && b.value.length >= 5},
            {label: "11+", logic: (b) => b.value.length >= 11}
        ];

        for (let item of groups) {
            csvData.push([
                item.label,
                groupedBills.filter(item.logic).length
            ])
        }



        let csvDataBirth = [[
            "Tên khách",
            "SĐT",
            "Ngày sinh"
        ]];

        for (let customer of (customersBirth || [])) {
            csvDataBirth.push([
                customer.customerName,
                customer.customerPhone,
                moment(customer.birthDate).format("DD/MM/YYYY")
            ])
        }

        const components = {
            "Chi Tiêu": (
                <ReportCustomerSpend
                    bills={bills}
                    customers={customers}
                    loading={loading}
                />
            ),
            "Số Lần Mua": (
                <ReportCustomerBuyCount
                    groupedBills={groupedBills}
                    loading={loading}
                    customers={customers}
                />
            ),
            "Loại": (
                <ReportCustomerType
                    groupedBills={groupedBills}
                    loading={loading}
                    customers={customers}
                    bills={bills}
                    types={types}
                />
            ),
            "Màu": (
                <ReportCustomerColor
                    groupedBills={groupedBills}
                    loading={loading}
                    customers={customers}
                    bills={bills}
                    colors={colors}
                />
            )
        };


        let columns = [{
            label: "Tên",
            display: (customer) => customer.customerName,
            sortBy: (customer) => customer.customerName,
            width: "33.33%",
            minWidth: "150",
        }, {
            label: "Số Điện Thoại",
            display: (customer) => customer.customerPhone,
            sortBy: (customer) => customer.customerPhone,
            width: "33.33%",
            minWidth: "150",
        }, {
            label: "Sinh Nhật",
            display: (customer) => moment(customer.birthDate).format("DD/MM/YYYY"),
            sortBy: (customer) => moment(customer.birthDate).format("DD/MM/YYYY"),
            width: "33.33%",
            minWidth: "150",
        }];


        return (
            <Layout activeRoute="Khách Hàng">

                <div className="card bill-report-route">
                    <div className="card-title">
                        Báo cáo khách hàng

                        <div className="text-info margin-top">
                            Tổng số lần mua: <b className="text-primary">{bills.length}</b>
                        </div>

                        <div className="text-info">
                            Khách mới: <b className="text-primary">{bills.filter(b => b.isNewCustomer).length}</b>
                        </div>

                        <div className="text-info">
                            Khách làm thẻ VIP: <b className="text-primary">{vips.filter(v => new Date(v.created).getTime() > from.getTime() && new Date(v.created).getTime() < to.getTime()).length} </b>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="row first-margin"
                        >
                            <DatePicker
                                className="col"
                                label="Từ Ngày"
                                value={from}
                                onChange={(from) => {
                                    this.setState({from});
                                    defaultReportDayService.set({...defaultReportDayService.get(), from});
                                }}
                            />

                            <DatePicker
                                className="col"
                                label="Tới Ngày"
                                value={to}
                                onChange={(to) => {
                                    this.setState({to});
                                    defaultReportDayService.set({...defaultReportDayService.get(), to});
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

                        <Select
                            className="first-margin"
                            label="Theo"
                            value={viewType}
                            list={["Chi Tiêu", "Số Lần Mua", "Loại", "Màu"]}
                            onChange={(viewType) => this.setState({viewType})}
                        />
                    </div>


                    {components[viewType]}

                </div>

                <div className="card">
                    <div className="card-title">
                        Khách sinh nhật trong tháng {new Date().getMonth() + 1}
                    </div>

                    <DataTable
                        columns={columns}
                        rows={customersBirth}
                        loading={!customersBirth}
                    />

                </div>

            </Layout>
        );
    }
}