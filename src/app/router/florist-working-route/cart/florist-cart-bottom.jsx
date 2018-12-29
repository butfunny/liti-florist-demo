import React, {Fragment} from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import {FloristCartDetails} from "./florist-cart-details";
import {CSSTransition} from "react-transition-group";
import sumBy from "lodash/sumBy";
import classnames from "classnames";
import {floristApi} from "../../../api/florist-api";
import {premisesInfo} from "../../../security/premises-info";
export class FloristCartBottom extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            saving: false
        }
    }

    submitOrder() {
        let {selectedItems, bill, history, items} = this.props;
        this.setState({saving: true});
        floristApi.submitBill({
            selectedFlower: selectedItems.map(i => {
                return {
                    itemID: i.itemID,
                    price: items.find(item => item._id == i.itemID).price,
                    quantity: i.quantity,
                    supplier: i.supplier
                }
            }),
            premises_id: premisesInfo.getActivePremise()._id,
            billID: bill._id,
            status: bill.ships.length == 0 ? "Done" : "Chờ giao"
        }).then(() => {
            history.push(`/florist`);
        })
    }

    render() {

        let {bill, selectedItems, onChange, items} = this.props;
        let {open, saving} = this.state;
        const getTotal = () => {
            let price = 0;
            for (let item of selectedItems) {
                let itemFound = items.find(i => i._id == item.itemID);
                price += itemFound.price * item.quantity;
            }

            return price;
        };

        const isDisabled = getTotal() > (getTotalBill(bill) + (getTotalBill(bill) * 10 / 100));

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
                        <span className={classnames(getTotal() > getTotalBill(bill) && "text-warning")}>{formatNumber(getTotal())}đ</span> / {formatNumber(getTotalBill(bill))}đ
                    </div>

                    { selectedItems.length > 0 && (
                        <button
                            disabled={isDisabled}
                            className="btn btn-info" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.submitOrder();
                        }}>
                            <span className="btn-inner--text">Done</span>
                            { saving && (<span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>)}
                        </button>
                    )}
                </div>
            </Fragment>
        );
    }
}