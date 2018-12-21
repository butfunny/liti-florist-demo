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
import {getCSVData} from "../../order/excel";
import {CSVLink} from "react-csv";
export class RevenueReportCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            selectedType: "Trong tuần"
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

        let {customers, bills, filterType, lastInitBills} = this.props;
        let {keyword} = this.state;

        const customerMapped = customers.map(c => ({
            ...c,
            totalPay: sumBy(bills, b => b.customerId == c._id ? getTotalBill(b) : 0),
            totalLastPay: sumBy(lastInitBills, b => b.customerId == c._id ? getTotalBill(b) : 0)
        }));

        const getPayOfPremises = (customerId, premises_id, bills) => {
            const customerBills = bills.filter(b => b.customerId == customerId && b.premises_id == premises_id);
            return {
                pay: sum(customerBills.map(b => getTotalBill(b))),
                total: customerBills.length
            }
        };

        let premises = premisesInfo.getPremises();

        const customerFiltered = customerMapped.filter((c) => (c.customerName || "").indexOf(keyword) > -1 || (c.customerPhone || "").indexOf(keyword) > -1);

        let CSVdata = [[
            "Tên khách",
            "SĐT",
            ...premises.map(p => `Chi tại ${p.name}`),
            "Tổng Chi",
        ]];

        for (let customer of customerMapped) {
            CSVdata.push([
                customer.customerName,
                customer.customerPhone,
                ...premises.map(p => getPayOfPremises(customer._id, p._id, bills).pay),
                customer.totalPay
            ])

        }


        return (
            <div className="revenue-report-customer">
                <Input
                    value={keyword}
                    onChange={(e) => this.setState({keyword: e.target.value})}
                    placeholder="Tìm kiếm khách hàng theo tên hoặc số điện thoại"
                />

                <CSVLink
                    data={CSVdata}
                    filename={"bao-cao-doanh-thu-khach-hang.csv"}
                    className="btn btn-info btn-icon btn-excel btn-sm">
                    <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                    <span className="btn-inner--text">Xuất Excel</span>
                </CSVLink>

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
                                        {p.name}: {formatNumber(getPayOfPremises(customer._id, p._id, bills).pay)} - {getPayOfPremises(customer._id, p._id, bills).total} lần
                                    </div>
                                ))}
                            </td>

                            <td>
                                {formatNumber(customer.totalPay)}
                            </td>

                            <td>
                                { filterType == "Trong Tuần" && (
                                    <span>
                                        { customer.totalPay > customer.totalLastPay ? (
                                            <span className="text-info"><i className="fa fa-arrow-up"/> ({formatNumber(customer.totalPay - customer.totalLastPay)})</span>
                                        ) : (
                                            <span className="text-danger"><i className="fa fa-arrow-up"/> ({formatNumber(customer.totalLastPay - customer.totalPay)})</span>
                                        )}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}