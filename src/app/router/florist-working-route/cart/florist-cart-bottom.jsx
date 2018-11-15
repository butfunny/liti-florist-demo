import React from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
export class FloristCartBottom extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bill} = this.props;

        return (
            <div className="florist-cart-bottom">
                <div className="bill-title">
                    <b>{bill.bill_number}</b> <span className="text-info">Chi tiết</span>
                </div>
                <div className="cart-price">
                    0đ / {formatNumber(getTotalBill(bill))}đ
                </div>

                <button className="btn btn-primary">
                    Giao hàng
                </button>
            </div>
        );
    }
}