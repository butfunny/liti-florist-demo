import React, {Fragment} from "react";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import {premisesInfo} from "../../security/premises-info";
export class CustomerBillModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bills, onClose} = this.props;


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
                                                    <b>{premises.find(p => p._id == bill.base_id).name}</b>
                                                    { bill.items.map((item, index) => (
                                                        <div key={index}>
                                                            <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="timeline-footer ng-binding">
                                                    { bill.payment_type == "Nợ" && <span className="text-danger">Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                                                    { bill.payment_type != "Nợ" && <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
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
        );
    }
}