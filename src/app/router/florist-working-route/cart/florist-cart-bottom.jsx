import React, {Fragment} from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import {FloristCartDetails} from "./florist-cart-details";
import {CSSTransition} from "react-transition-group";
import sumBy from "lodash/sumBy";
export class FloristCartBottom extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        }
    }

    render() {

        let {bill, selectedItems, onChange, items} = this.props;
        let {open} = this.state;

        return (
            <Fragment>

                <CSSTransition
                    in={open}
                    unmountOnExit
                    timeout={300}
                    classNames="swipe-up-animation"
                >
                    <FloristCartDetails
                        items={items}
                        selectedItems={selectedItems}
                        onChange={onChange}
                        bill={bill}
                        onClose={() => this.setState({open: false})}
                    />
                </CSSTransition>

                <div className="florist-cart-bottom" onClick={() => this.setState({open: true})}>
                    <div className="bill-title">
                        <b>{bill.bill_number}</b> <span className="text-info">Chi tiết</span>
                    </div>
                    <div className="cart-price">
                        {formatNumber(sumBy(selectedItems, (p) => p.price))}đ / {formatNumber(getTotalBill(bill))}đ
                    </div>

                    <button className="btn btn-primary">
                        Giao hàng
                    </button>
                </div>
            </Fragment>
        );
    }
}