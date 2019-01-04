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

    componentDidMount() {
        this.getCustomerBills();
    }

    getCustomerBills() {

        let {keyword, page} = this.state;
        this.setState({loading: true});

        customerApi.getCustomers({
            keyword,
            skip: (page - 1) * 50
        }).then(({customers, bills, total}) => {
            this.setState({customers, bills, loading: false, total})
        });
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


        return (
            <Layout
                activeRoute="Danh Sách Khách Hàng"
            >
                { permission[user.role].indexOf("customer.list") == -1 ? (
                    <div>
                        Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                    </div>
                ) : (
                    <div className="customers-route">
                        <div className="ct-page-title">
                            <h1 className="ct-title">Danh Sách Khách Hàng</h1>
                        </div>

                        <Input
                            onKeyDown={(e) => !loading && e.keyCode == 13 && this.setState({page: 1}, () => this.getCustomerBills())}
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Nhấn enter để bắt đầu tìm"
                        />

                        { !customers && <span>Đang tải... <i className="fa fa-spinner fa-pulse"/></span>}

                        { customers && (
                            <LoadingOverlay
                                show={loading}
                            >
                                <div className="table-wrapper">

                                    <div className="row tb-header">
                                        <div className="col col-md-6">
                                            Khách hàng
                                        </div>
                                        <div className="col col-md-4">
                                            Tổng chi
                                        </div>
                                        <div className="col col-md-2"/>
                                    </div>

                                    <div className="table-data">
                                        { customers.map((customer, index) => (
                                            <div className="row" key={index}>
                                                <div className="col col-md-6">
                                                    <div>{customer.customerName}</div>
                                                    {customer.customerPhone}

                                                    <div>
                                                        <b>Số tiền đã chi tại từng cơ sở: </b>
                                                    </div>

                                                    { premises.map((p, index) => (
                                                        <div key={index}>
                                                            {p.name}: {formatNumber(getPayOfPremises(customer._id, p._id))}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="col col-md-4">
                                                    {formatNumber(getTotalPay(customer._id, false))}

                                                    { getTotalPay(customer._id, true) > 0 && <div className="text-danger">Nợ <b>{formatNumber(getTotalPay(customer._id, true))}</b></div>}
                                                </div>

                                                <div className="col col-md2">
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => this.viewBills(customer)}>
                                                        Xem lịch sử
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                        }
                                    </div>
                                </div>
                            </LoadingOverlay>
                        )}

                        <div className="table-footer">
                            <div className="total">
                                <b>Tổng số khách hàng: {total}</b>
                            </div>

                            { customers && (
                                <Pagination
                                    value={page || 1}
                                    total={Math.round(total / 50) }
                                    onChange={(newPage) => !loading && page != newPage && this.setState({page: newPage}, () => this.getCustomerBills()) }
                                />
                            )}
                        </div>
                    </div>
                )}
            </Layout>
        );
    }
}