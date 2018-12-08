import React from "react";
import {InputNumber} from "../../../components/input-number/input-number";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import classnames from "classnames";
export class FloristCartDetails extends React.Component {

    constructor(props) {
        super(props);
    }

    handleChange(qty, id) {
        let {selectedItems, onChange} = this.props;
        let ret = [...selectedItems];

        let found = ret.find(s => s.itemID == id);
        if (!found) onChange(ret.concat({itemID: id, quantity: qty}));
        else {
            found.quantity = qty;
            onChange(ret);
        }
    }

    render() {

        let {onClose, bill, selectedItems, items} = this.props;

        const getQtyItem = (id) => {
            let found = selectedItems.find(s => s.itemID == id);
            if (found) return found.quantity;
            return selectedItems.filter(s => s.name == name).length
        };

        const getMaxQtyItem = (id) => items.find(i => i._id == id).quantity;
        return (
            <div className="florist-cart-details">
                <div className="cart-title bg-gradient-primary">
                    {bill.bill_number}

                    <div className="close-btn" onClick={onClose}>
                        <i className="fa fa-close"/>
                    </div>
                </div>

                <div className={classnames("cart-body", bill.image && "has-image")}>

                    <div className="bill-info bg-secondary">
                        { bill.items.map((item, index) => (
                            <div key={index}>
                                <b>{item.quantity}</b> {item.flowerType} {item.name}
                            </div>
                        ))}
                    </div>

                    {bill.image && (
                        <img src={bill.image} alt=""/>
                    )}


                    { selectedItems.map((item, index) => (
                        <div className="product" key={index}>
                            <div className="title">
                                {item.name}
                            </div>

                            <div className="price">
                                {formatNumber(item.price)}đ
                            </div>

                            <div className="qty">
                                Tồn kho: <b>{getMaxQtyItem(item.itemID)}</b>
                            </div>

                            <div className="action">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                    if (getQtyItem(item.itemID) > 0) {
                                        this.handleChange(getQtyItem(item.itemID) - 1, item.itemID)
                                    }
                                }}>
                                    <i className="fa fa-minus"/>
                                </button>

                                <InputNumber
                                    autoSelect
                                    value={getQtyItem(item.itemID)}
                                    onChange={(qty) => {
                                        if (qty > getMaxQtyItem(item.itemID)) {
                                            this.handleChange(getMaxQtyItem(item.itemID), item.itemID);
                                            return;
                                        }

                                        if (qty < 0) {
                                            this.handleChange(0, item.itemID);
                                            return;
                                        }

                                        this.handleChange(qty, item.itemID);
                                    }}
                                />

                                <button type="button" className="btn btn-info btn-sm btn-right" onClick={() => {
                                    if (getQtyItem(item.itemID) <= getMaxQtyItem(item.itemID)) {
                                        this.handleChange(getQtyItem(item.itemID) + 1, item.itemID)
                                    }
                                }}>
                                    <i className="fa fa-plus"/>
                                </button>
                            </div>
                        </div>
                    ))}


                </div>
            </div>
        );
    }
}