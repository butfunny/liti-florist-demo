import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {customerApi} from "../../api/customer-api";
import {billApi} from "../../api/bill-api";
import {Input} from "../../components/input/input";
import sum from "lodash/sum";
import sortBy from "lodash/sortBy"
import moment from "moment";
import {filteredByKeys, formatNumber, getTotalBill} from "../../common/common";
import {modals} from "../../components/modal/modals";
import {CustomerBillModal} from "./customer-bill-modal";
import {premisesInfo} from "../../security/premises-info";
export class Customers extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            from: today,
            to: endDay,
            customers: null,
            fullBills: [],
            filter: "Toàn thời gian",
            bills: [],
            keyword: ""
        };

        let {from, to} = this.state;

        customerApi.getCustomers().then(({customers, bills}) => {
            billApi.getAllBills({from, to}).then((filteredBill) => {
                this.setState({customers, fullBills: bills, bills: filteredBill})
            });
        });


    }

    getCustomerBills() {

        let {from, to} = this.state;

        billApi.getAllBills({from, to}).then((bills) => {
            this.setState({bills})
        })
    }

    viewBills(customer) {
        let {filter, fullBills, bills} = this.state;
        let customerBills = filter == "Toàn thời gian" ? fullBills : bills;
        customerBills = customerBills.filter(b => b.customer_id == customer._id);

        const modal = modals.openModal({
            content: (
                <CustomerBillModal
                    bills={customerBills}
                    onClose={() => modal.close()}
                />
            )
        })
    }

    render() {

        let {from, to, customers, fullBills, bills, filter, keyword} = this.state;


        const getTotalPay = (customer_id, isOwe) => {
            let _bills = filter == "Toàn thời gian" ? fullBills : bills;

            if (isOwe) _bills = _bills.filter(b => b.payment_type == "Nợ");
            else _bills = _bills.filter(b => b.payment_type != "Nợ");

            const customerBills = _bills.filter(b => b.customer_id == customer_id);
            return sum(customerBills.map(b => getTotalBill(b.items)))
        };

        const customersFiltered = customers ? filteredByKeys(customers, ["name", "phone"], keyword) : [];


        const getPayOfPremises = (customer_id, premises_id) => {
            let _bills = filter == "Toàn thời gian" ? fullBills : bills;
            const customerBills = _bills.filter(b => b.customer_id == customer_id && b.premises_id == premises_id);
            return sum(customerBills.map(b => getTotalBill(b.items)))
        };

        let premises = premisesInfo.getPremises();


        return (
            <Layout
                activeRoute="Khách Hàng"
            >
                <div className="customers-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Danh Sách Khách Hàng</h1>
                    </div>

                    <div className="report-header row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <select
                                    className="form-control"
                                    value={filter}
                                    onChange={(e) => this.setState({filter: e.target.value})}
                                >
                                    <option value="Toàn thời gian">Toàn thời gian</option>
                                    <option value="Lọc theo ngày">Lọc theo ngày</option>
                                </select>
                            </div>
                        </div>

                        { filter == "Lọc theo ngày" && (
                            <div className="col-md-6 row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="control-label">Từ ngày</label>
                                        <DatePicker
                                            value={from}
                                            onChange={(from) => {
                                                this.setState({from}, () => this.getCustomerBills())
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="control-label">Tới ngày</label>
                                        <DatePicker
                                            value={to}
                                            onChange={(to) => this.setState({to}, () => this.getCustomerBills())}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm kiếm"
                        />
                    </div>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Khách hàng</th>
                            <th scope="col">Tổng chi</th>
                            <th scope="col"/>
                        </tr>
                        </thead>
                        <tbody>
                        { customers && sortBy(customersFiltered, c => getTotalPay(c._id)).reverse().map((customer, index) => (
                            <tr key={index}>
                                <td>
                                    <div>{customer.name}</div>
                                    {customer.phone}

                                    <div>
                                        <b>Số tiền đã chi tại từng cơ sở: </b>
                                    </div>

                                    { premises.map((p, index) => (
                                        <div key={index}>
                                            {p.name}: {formatNumber(getPayOfPremises(customer._id, p._id))}
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    {formatNumber(getTotalPay(customer._id, false))}

                                    { getTotalPay(customer._id, true) > 0 && <div className="text-danger">Nợ <b>{formatNumber(getTotalPay(customer._id, true))}</b></div>}
                                </td>

                                <td>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => this.viewBills(customer)}>
                                        Xem lịch sử
                                    </button>
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