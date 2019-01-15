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
export class ReportCustomerRoute extends React.Component {

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
            viewType: "Số Lần Mua",
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
        this.setState({loading: true, bills: [], customers: [], vips: []});
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
            "Số Lần Mua": (
                <ReportCustomerBuyCount
                    groupedBills={groupedBills}
                    loading={loading}
                    customers={customers}
                />
            )
        }


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

                        <Select
                            className="first-margin"
                            label="Theo"
                            value={viewType}
                            list={["Số Lần Mua"]}
                            onChange={(viewType) => this.setState({viewType})}
                        />
                    </div>


                    {components[viewType]}


                </div>



                {/*<div className="report-route bill-report-route">*/}
                    {/*<div className="ct-page-title">*/}
                        {/*<h1 className="ct-title">Báo cáo khách hàng</h1>*/}
                    {/*</div>*/}

                    {/*<div className="report-header row">*/}
                        {/*<div className="col-md-4">*/}
                            {/*<div className="form-group">*/}
                                {/*<label className="control-label">Từ ngày</label>*/}
                                {/*<DatePicker*/}
                                    {/*value={from}*/}
                                    {/*onChange={(from) => {*/}
                                        {/*this.setState({from})*/}
                                    {/*}}*/}
                                {/*/>*/}
                            {/*</div>*/}
                        {/*</div>*/}

                        {/*<div className="col-md-4">*/}
                            {/*<div className="form-group">*/}
                                {/*<label className="control-label">Tới ngày</label>*/}
                                {/*<DatePicker*/}
                                    {/*value={to}*/}
                                    {/*onChange={(to) => this.setState({to})}*/}
                                {/*/>*/}
                            {/*</div>*/}
                        {/*</div>*/}

                        {/*<div className="col-md-4">*/}
                            {/*<button className="btn btn-info btn-sm btn-get btn-icon"*/}
                                    {/*disabled={loading}*/}
                                    {/*onClick={() => this.getReport()}>*/}
                                {/*Xem Hoá Đơn*/}

                                {/*{ loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}*/}
                            {/*</button>*/}
                        {/*</div>*/}
                    {/*</div>*/}

                    {/*{ !loading && (*/}
                        {/*<div className="form-group">*/}
                            {/*<h6>*/}
                                {/*Tổng số lần mua: <b className="text-primary">{bills.length}</b>*/}
                            {/*</h6>*/}

                            {/*<h6>*/}
                                {/*Khách mới: <b className="text-primary">{bills.filter(b => b.isNewCustomer).length}</b>*/}
                            {/*</h6>*/}

                            {/*<h6>*/}
                                {/*Khách làm thẻ VIP: <b className="text-primary">*/}
                                {/*{vips.filter(v => new Date(v.created).getTime() > from.getTime() && new Date(v.created).getTime() < to.getTime()).length}*/}
                            {/*</b>*/}
                            {/*</h6>*/}

                            {/*<div className="row">*/}
                                {/*<div className="col-md-6">*/}

                                    {/*{!loading && (*/}
                                        {/*<CSVLink*/}
                                            {/*data={csvData}*/}
                                            {/*filename={`bao-cao-so-lan-mua-hang.csv`}*/}
                                            {/*className="btn btn-info btn-icon btn-excel btn-sm">*/}
                                            {/*<span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>*/}
                                            {/*<span className="btn-inner--text">Xuất Excel</span>*/}
                                        {/*</CSVLink>*/}
                                    {/*)}*/}

                                    {/*<table className="table table-hover">*/}
                                        {/*<thead>*/}
                                        {/*<tr>*/}
                                            {/*<th scope="col">Số lần mua hàng</th>*/}
                                            {/*<th scope="col">Số khách</th>*/}
                                        {/*</tr>*/}
                                        {/*</thead>*/}
                                        {/*<tbody>*/}

                                        {/*{ groups.map((item, index) => (*/}
                                            {/*<tr key={index}>*/}
                                                {/*<td>{item.label}</td>*/}
                                                {/*<td>{groupedBills.filter(item.logic).length}</td>*/}
                                            {/*</tr>*/}
                                        {/*))}*/}
                                        {/*</tbody>*/}
                                    {/*</table>*/}
                                {/*</div>*/}

                                {/*<ReportBillItem*/}
                                    {/*bills={bills}*/}
                                    {/*types={types}*/}
                                    {/*colors={colors}*/}
                                    {/*loading={loading}*/}
                                {/*/>*/}

                                {/*<div className="form-group col-md-6">*/}


                                    {/*{customersBirth && (*/}
                                        {/*<CSVLink*/}
                                            {/*data={csvDataBirth}*/}
                                            {/*filename={`bao-cao-sinh-nhat-khach.csv`}*/}
                                            {/*className="btn btn-info btn-icon btn-excel btn-sm">*/}
                                            {/*<span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>*/}
                                            {/*<span className="btn-inner--text">Xuất Excel</span>*/}
                                        {/*</CSVLink>*/}
                                    {/*)}*/}

                                    {/*<table className="table table-hover">*/}
                                        {/*<thead>*/}
                                        {/*<tr>*/}
                                            {/*<th scope="col">Khách sinh nhật trong tháng {new Date().getMonth() + 1}</th>*/}
                                        {/*</tr>*/}
                                        {/*</thead>*/}
                                        {/*<tbody>*/}
                                        {/*{ !customersBirth && (*/}
                                            {/*<tr>*/}
                                                {/*<td>Đang tải....</td>*/}
                                            {/*</tr>*/}
                                        {/*)}*/}

                                        {/*{ customersBirth && customersBirth.map((customer, index) => (*/}
                                            {/*<tr key={index}>*/}
                                                {/*<td>*/}
                                                    {/*{customer.customerName} - {customer.customerPhone}*/}
                                                    {/*<div>*/}
                                                        {/*Sinh nhật: <b>{moment(customer.birthDate).format("DD/MM/YYYY")}</b>*/}
                                                    {/*</div>*/}
                                                {/*</td>*/}
                                            {/*</tr>*/}
                                        {/*))}*/}
                                        {/*</tbody>*/}
                                    {/*</table>*/}
                                {/*</div>*/}
                            {/*</div>*/}




                        {/*</div>*/}
                    {/*)}*/}

                {/*</div>*/}
            </Layout>
        );
    }
}