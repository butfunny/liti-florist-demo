import React from "react";
import {Layout} from "../../components/layout/layout";
import {customerApi} from "../../api/customer-api";
import {Input} from "../../components/input/input";
import sum from "lodash/sum";
import {filteredByKeys, formatNumber, getTotalBill} from "../../common/common";
import {modals} from "../../components/modal/modals";
import {CustomerBillModal} from "./customer-bill-modal";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {Pagination} from "../../components/pagination/pagination";
import {LoadingOverlay} from "../../components/loading-overlay/loading-overlay";
import {userInfo} from "../../security/user-info";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
export class Customers extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            customers: null,
            page: 1,
            keyword: "",
            bills: null,
            total: 0,
            loading: false,
        };


    }


    viewBills(customer) {
        let {bills} = this.state;

        const modal = modals.openModal({
            content: (
                <CustomerBillModal
                    bills={bills.filter(b => b.customerId == customer._id)}
                    onClose={() => modal.close()}
                />
            )
        })
    }

    render() {

        let {customers, bills, keyword, loading, page, total} = this.state;


        const getTotalPay = (customerId, isOwe) => {
            let _bills = [];
            if (isOwe) _bills = bills.filter(b => b.to && b.to.paymentType == "Nợ");
            else _bills = bills.filter(b => b.to ? b.to.paymentType != "Nợ" : true);

            const customerBills = _bills.filter(b => b.customerId == customerId);
            return sum(customerBills.map(b => getTotalBill(b)))
        };


        const getPayOfPremises = (customerId, premises_id) => {
            const customerBills = bills.filter(b => b.customerId == customerId && b.premises_id == premises_id);
            return sum(customerBills.map(b => getTotalBill(b)))
        };

        let premises = premisesInfo.getPremises();
        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        let columns = [{
            label: "Khách Hàng",
            width: "25%",
            display: (row) => row.customerName,
            sortKey: "customerName",
            minWidth: "200"
        }, {
            label: "Điện Thoại",
            width: "15%",
            display: (row) => row.customerPhone,
            sortKey: "customerPhone",
            minWidth: "150"
        }, {
            label: "Tổng Tiền",
            width: "15%",
            display: (row) => formatNumber(row.totalPay),
            sortKey: "totalPay",
            minWidth: "100"
        }, {
            label: "Tổng Đơn",
            width: "15%",
            display: (row) => formatNumber(row.totalBill),
            sortKey: "totalBill",
            minWidth: "100"
        }, {
            label: "Miêu tả",
            width: "15%",
            display: (row) => "Miêu tả",
            minWidth: "100"
        }, {
            label: "Màu",
            width: "5%",
            display: (row) => "Màu",
            minWidth: "100"
        }, {
            label: "Size",
            width: "5%",
            display: (row) => "Size",
            minWidth: "100"
        }, {
            label: "Loại",
            width: "5%",
            display: (row) => "Loại",
            minWidth: "100"
        }];


        return (
            <Layout
                activeRoute="Danh Sách Khách Hàng"
            >
                <div className="card">
                    <div className="card-title">
                        Danh Sách Khách Hàng
                    </div>


                    <PaginationDataTable
                        total={total}
                        columns={columns}
                        rows={customers}
                        api={({keyword, page, sortKey, isDesc}) => {
                            return customerApi.getCustomers({
                                keyword,
                                skip: (page - 1) * 15,
                                sortKey,
                                isDesc
                            }).then(({customers, bills, total, vips}) => {
                                this.setState({customers, bills, total, vips});
                                return Promise.resolve();
                            })
                        }}
                    />


                    {/*{ customers && (*/}
                        {/*<LoadingOverlay*/}
                            {/*show={loading}*/}
                        {/*>*/}
                            {/*<div className="table-wrapper">*/}

                                {/*<div className="row tb-header">*/}
                                    {/*<div className="col col-md-6">*/}
                                        {/*Khách hàng*/}
                                    {/*</div>*/}
                                    {/*<div className="col col-md-4">*/}
                                        {/*Tổng chi*/}
                                    {/*</div>*/}
                                    {/*<div className="col col-md-2"/>*/}
                                {/*</div>*/}

                                {/*<div className="table-data">*/}
                                    {/*{ customers.map((customer, index) => (*/}
                                        {/*<div className="row" key={index}>*/}
                                            {/*<div className="col col-md-6">*/}
                                                {/*<div>{customer.customerName}</div>*/}
                                                {/*{customer.customerPhone}*/}

                                                {/*<div>*/}
                                                    {/*<b>Số tiền đã chi tại từng cơ sở: </b>*/}
                                                {/*</div>*/}

                                                {/*{ premises.map((p, index) => (*/}
                                                    {/*<div key={index}>*/}
                                                        {/*{p.name}: {formatNumber(getPayOfPremises(customer._id, p._id))}*/}
                                                    {/*</div>*/}
                                                {/*))}*/}
                                            {/*</div>*/}
                                            {/*<div className="col col-md-4">*/}
                                                {/*{formatNumber(getTotalPay(customer._id, false))}*/}

                                                {/*{ getTotalPay(customer._id, true) > 0 && <div className="text-danger">Nợ <b>{formatNumber(getTotalPay(customer._id, true))}</b></div>}*/}
                                            {/*</div>*/}

                                            {/*<div className="col col-md2">*/}
                                                {/*<button className="btn btn-outline-primary btn-sm" onClick={() => this.viewBills(customer)}>*/}
                                                    {/*Xem lịch sử*/}
                                                {/*</button>*/}
                                            {/*</div>*/}
                                        {/*</div>*/}
                                    {/*))*/}
                                    {/*}*/}
                                {/*</div>*/}
                            {/*</div>*/}
                        {/*</LoadingOverlay>*/}
                    {/*)}*/}
                </div>
            </Layout>
        );
    }
}