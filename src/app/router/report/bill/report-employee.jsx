import React, {Fragment} from "react";
import concat from "lodash/concat";
import sortBy from "lodash/sortBy";
import {formatNumber, getSalary, getTotalBill} from "../../../common/common";
import sumBy from "lodash/sumBy";
import moment from "moment";
import {premisesInfo} from "../../../security/premises-info";
import {modals} from "../../../components/modal/modals";
export class ReportEmployee extends React.Component {

    constructor(props) {
        super(props);
    }

    viewBills(e) {

        let {bills} = this.props;

        const modal = modals.openModal({
            content: (
                <SalaryModal
                    onClose={() => modal.close()}
                    user={e}
                    bills={bills.filter(b => {
                        if (b.status == "Done") {
                            if (b.sales.find(u => u.username == e.username)) {
                                return true
                            }

                            if (b.florists.find(u => u.username == e.username)) {
                                return true
                            }

                            if (b.ships.find(u => u.username == e.username)) {
                                return true
                            }
                        }

                        return false;
                    })}
                />
            )
        })
    }

    render() {

        let {bills, sales, florists, ships} = this.props;

        let employees = concat(sales, florists, ships);

        employees = employees.map((e) => ({
            ...e,
            totalGet: sumBy(bills, b => {
                if (b.sales.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                if (b.florists.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                if (b.ships.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                return 0;

            })
        }));

        return (
            <div className="report-employee">
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">Nhân Viên</th>
                        <th scope="col">Tổng Thu</th>
                        <th scope="col"/>
                    </tr>
                    </thead>
                    <tbody>
                    { sortBy(employees, c => -c.totalGet).map((item, index) => (
                        <tr key={index}>
                            <td>
                                <div>{item.username}</div>
                                {item.role}
                            </td>

                            <td>
                                {formatNumber(item.totalGet)}
                            </td>

                            <td>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => this.viewBills(item)}>
                                    Chi tiết
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


class SalaryModal extends React.Component {

    render() {

        let {bills, onClose, user} = this.props;

        let billsMapped = [];

        const isSameDay = (day1, day2) => {
            return day1.getDate() == day2.getDate() && day1.getMonth() == day2.getMonth() && day1.getFullYear() == day2.getFullYear();
        };

        for (let bill of bills) {
            let found = billsMapped.find(b => isSameDay(new Date(b.date), new Date(bill.created)));
            if (found) {
                found.bills.push(bill);
            } else {
                billsMapped.push({
                    bills: [bill],
                    date: bill.created
                })
            }
        }
        let premises = premisesInfo.getPremises();

        return (
            <div className="app-modal-box customer-bill-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lịch sử mua hàng</h5>
                        <button type="button" className="close" onClick={() => onClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <ul className="timeline">

                            { sortBy(billsMapped, b => b.date).reverse().map((item, index) => (
                                <Fragment key={index}>
                                    <li className="time-label">
                                      <span>
                                        {moment(item.date).format("DD/MM/YYYY")}
                                      </span>
                                    </li>

                                    <li>
                                        <i className="fa fa-shopping-cart bg-blue"/>

                                        { sortBy(item.bills, b => b.created).reverse().map((bill, index) => (
                                            <div className="timeline-item ng-scope" key={index}>
                                                <span className="time ng-binding"><i className="fa fa-clock-o"/> {moment(bill.created).format("HH:mm")}</span>


                                                <div className="timeline-body">
                                                    <b>{premises.find(p => p._id == bill.premises_id).name}</b>
                                                    { bill.items.map((item, index) => (
                                                        <div key={index}>
                                                            <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="timeline-footer ng-binding">
                                                    <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>
                                                    <br/>
                                                    <span>Nhận: <b>{formatNumber(getSalary(user, bill).money)} {getSalary(user, bill).percent && <span className="text-primary">({getSalary(user, bill).percent}%)</span>}</b></span>
                                                </div>

                                            </div>
                                        ))}

                                    </li>
                                </Fragment>
                            ))}

                            <li>
                                <i className="fa fa-clock-o bg-gray"/>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}