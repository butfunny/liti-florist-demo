import React from "react";
import {Input} from "../../../components/input/input";
import sumBy from "lodash/sumBy";
import sortBy from "lodash/sortBy";
import classnames from "classnames";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../../common/common";
import {UploadBtn} from "../../order/bill-order";
import sum from "lodash/sum";
import {premisesInfo} from "../../../security/premises-info";
import {modals} from "../../../components/modal/modals";
import {CustomerBillModal} from "../../customers/customer-bill-modal";
export class RevenueReportCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyword: ""
        }
    }

    viewBills(customer) {
        let {bills} = this.props;

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

        let {customers, bills} = this.props;
        let {keyword} = this.state;

        const customerMapped = customers.map(c => ({
            ...c,
            totalPay: sumBy(bills, b => b.customerId == c._id ? getTotalBill(b) : 0)
        }));

        const getPayOfPremises = (customerId, premises_id) => {
            const customerBills = bills.filter(b => b.customerId == customerId && b.premises_id == premises_id);
            return {
                pay: sum(customerBills.map(b => getTotalBill(b))),
                total: customerBills.length
            }
        };

        let premises = premisesInfo.getPremises();

        const customerFiltered = customerMapped.filter((c) => (c.customerName || "").indexOf(keyword) > -1 || (c.customerPhone || "").indexOf(keyword) > -1);

        return (
            <div className="revenue-report-customer">
                <Input
                    value={keyword}
                    onChange={(e) => this.setState({keyword: e.target.value})}
                    placeholder="Tìm kiếm khách hàng theo tên hoặc số điện thoại"
                />

                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">Thông Tin Khách</th>
                        <th scope="col">Tổng Chi</th>
                        <th scope="col" style={{width: "150px"}}/>
                    </tr>
                    </thead>
                    <tbody>
                    { sortBy(customerFiltered, c => -c.totalPay).map((customer, index) => (
                        <tr key={index}>
                            <td>
                                <div>{customer.customerName}</div>
                                {customer.customerPhone}


                                <div>
                                    <b>Số tiền đã chi tại từng cơ sở: </b>
                                </div>

                                { premises.map((p, index) => (
                                    <div key={index}>
                                        {p.name}: {formatNumber(getPayOfPremises(customer._id, p._id).pay)} - {getPayOfPremises(customer._id, p._id).total} lần
                                    </div>
                                ))}
                            </td>

                            <td>
                                {formatNumber(customer.totalPay)}
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
        );
    }
}