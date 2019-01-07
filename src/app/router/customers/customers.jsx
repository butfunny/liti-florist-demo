import React from "react";
import {Layout} from "../../components/layout/layout";
import {customerApi} from "../../api/customer-api";
import {Input} from "../../components/input/input";
import sum from "lodash/sum";
import sortBy from "lodash/sortBy";
import {filteredByKeys, formatNumber, getTotalBill} from "../../common/common";
import {modals} from "../../components/modal/modals";
import {CustomerBillModal} from "./customer-bill-modal";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {Pagination} from "../../components/pagination/pagination";
import {LoadingOverlay} from "../../components/loading-overlay/loading-overlay";
import {userInfo} from "../../security/user-info";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import classnames from "classnames"

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


    render() {

        let {customers, bills, total, vips} = this.state;


        let columns = [{
            label: "Khách Hàng",
            width: "15%",
            display: (row) => (
                <div className="customer-name">
                    {row.customerName} {vips.find(v => v.customerId == row._id) && <span className="text-danger vip">VIP</span>}
                </div>
            ),
            sortKey: "customerName",
            minWidth: "150"
        }, {
            label: "Điện Thoại",
            width: "10%",
            display: (row) => row.customerPhone,
            sortKey: "customerPhone",
            minWidth: "150"
        }, {
            label: "Tổng Tiền",
            width: "25%",
            display: (row) => <CustomerPayInfo row={row} bills={bills}/>,
            sortKey: "totalPay",
            minWidth: "200"
        }, {
            label: "Tổng Đơn",
            width: "15%",
            display: (row) => formatNumber(row.totalBill),
            sortKey: "totalBill",
            minWidth: "100"
        }, {
            label: "Miêu tả",
            width: "20%",
            display: (row) => <CustomerDescriptionInfo row={row} bills={bills} />,
            minWidth: "200"
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
                <div className="card customers-route">
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
                </div>
            </Layout>
        );
    }
}

class CustomerPayInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInfo: false
        }
    }

    render() {
        let {row, bills} = this.props;

        const getTotalPay = (customerId, isOwe) => {
            let _bills = [];
            if (isOwe) _bills = bills.filter(b => b.to && b.to.paymentType == "Nợ");

            const customerBills = _bills.filter(b => b.customerId == customerId);
            return sum(customerBills.map(b => getTotalBill(b)))
        };


        const getPayOfPremises = (customerId, premises_id) => {
            const customerBills = bills.filter(b => b.customerId == customerId && b.premises_id == premises_id);
            return sum(customerBills.map(b => getTotalBill(b)))
        };

        let premises = premisesInfo.getPremises();

        let {showInfo} = this.state;

        return (
            <div className="customer-pay">

                {formatNumber(row.totalPay)} {row.totalPay > 0 && <span className="show-info" onClick={() => this.setState({showInfo: !showInfo})}>{showInfo ? "Ẩn" : "Chi Tiết"}</span>}

                <div className="info-wrapper">
                    { getTotalPay(row._id, true) > 0 && <div className="text-danger info-item">Nợ: {formatNumber(getTotalPay(row._id, true))}</div>}

                    { showInfo && premises.filter(p => getPayOfPremises(row._id, p._id) > 0).map((p, index) => (
                        <div className="info-item" key={index}>
                            {p.name}: <b>{formatNumber(getPayOfPremises(row._id, p._id))}</b>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

class CustomerDescriptionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInfo: false
        }
    }

    componentWillReceiveProps(props) {
      this.setState({showInfo: false})
    }

    render() {

        let {bills, row} = this.props;

        const customerBills = bills.filter(b => b.customerId == row._id);

        const mapBillDescription = () => {
            let ret = [];
            for (let bill of customerBills) {
                for (let item of bill.items) {
                    let found = ret.find(r => r.name == item.name);
                    if (found) found.count++;
                    else ret.push({name: item.name, count: 1})
                }
            }

            return sortBy(ret, r => -r.count);
        };

        const descriptions = mapBillDescription();

        if (descriptions.length == 0) return null;
        let {showInfo} = this.state;


        return (
            <div className="customer-pay">
                <span className="text-primary">{descriptions[0].count}</span> {descriptions[0].name} {descriptions.length > 1 && <span className="show-info" onClick={() => this.setState({showInfo: !showInfo})}>{showInfo ? "Ẩn" : "Xem Thêm"}</span>}

                <div className="info-wrapper">
                    { showInfo && descriptions.slice(1).map((item, index) => (
                        <div className="info-item" key={index}>
                            <span className="text-primary">{item.count}</span> {item.name}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}