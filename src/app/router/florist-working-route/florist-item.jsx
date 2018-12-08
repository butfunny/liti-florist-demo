import React from "react";
import {InputNumber} from "../../components/input-number/input-number";
import {formatNumber, keysToArray} from "../../common/common";
import groupBy from "lodash/groupBy";
import classnames from "classnames";
export class FloristItem extends React.Component {

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

        let {label, items, className, keyword, selectedItems} = this.props;

        const getQtyItem = (id) => {
            let found = selectedItems.find(s => s.itemID == id);
            if (found) return found.quantity;
            return selectedItems.filter(s => s.name == name).length
        };

        return (
            <div className={`product-item ${className}`}>
                <div className="product-title">
                    {label}
                </div>

                <div className="product-item-wrapper">
                    {items && items.filter(i => i.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1).map((item, index) => (
                        <div className="product" key={index}>
                            <div className="title">
                                {item.name}
                            </div>
                            <div className="price">
                                {formatNumber(item.price)}đ
                            </div>

                            <div className="qty">
                                Tồn Kho: <b>{item.quantity}</b>
                            </div>

                            <div className="action">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                    if (getQtyItem(item._id) > 0) {
                                        this.handleChange(getQtyItem(item._id) - 1, item._id)
                                    }
                                }}>
                                    <i className="fa fa-minus"/>
                                </button>

                                <InputNumber
                                    autoSelect
                                    value={getQtyItem(item._id)}
                                    onChange={(qty) => {
                                        if (qty > item.quantity) {
                                            this.handleChange(item.quantity, item._id);
                                            return;
                                        }

                                        if (qty < 0) {
                                            this.handleChange(0, item._id);
                                            return;
                                        }

                                        this.handleChange(qty, item._id);
                                    }}
                                />

                                <button type="button" className="btn btn-info btn-sm btn-right" onClick={() => {
                                    if (getQtyItem(item._id) <= item.quantity) {
                                        this.handleChange(getQtyItem(item._id) + 1, item._id)
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