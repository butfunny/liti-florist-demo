import React from "react";
import {InputNumber} from "../../components/input-number/input-number";
import {formatNumber, keysToArray} from "../../common/common";
import groupBy from "lodash/groupBy";
import classnames from "classnames";
export class FloristItem extends React.Component {

    constructor(props) {
        super(props);
    }

    handleChange(qty, name) {
        let {selectedItems, items, onChange} = this.props;
        const ret = selectedItems.filter( s => s.name != name);
        onChange(ret.concat(items.filter(c => c.name == name).slice(0, qty)))
    }

    render() {

        let {label, items, className, keyword, selectedItems, onChange} = this.props;

        const getQtyItem = (name) => {
            return selectedItems.filter(s => s.name == name).length
        };

        return (
            <div className={`product-item ${className}`}>
                <div className="product-title">
                    {label}
                </div>

                <div className="product-item-wrapper">
                    {items && keysToArray(groupBy(items, i => i.name)).filter(i => i.key.toLowerCase().indexOf(keyword.toLowerCase()) > -1).map((item, index) => (
                        <div className="product" key={index}>
                            <div className="title">
                                {item.key}
                            </div>
                            <div className="price">
                                {formatNumber(item.value[0].price)}đ
                            </div>

                            <div className="qty">
                                Tồn Kho: <b>{item.value.length}</b>
                            </div>

                            <div className="action">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                    if (getQtyItem(item.key) > 0) {
                                        this.handleChange(getQtyItem(item.key) - 1, item.key)
                                    }
                                }}>
                                    <i className="fa fa-minus"/>
                                </button>

                                <InputNumber
                                    autoSelect
                                    value={getQtyItem(item.key)}
                                    onChange={(qty) => {
                                        if (qty > item.value.length) {
                                            this.handleChange(item.value.length, item.key);
                                            return;
                                        }

                                        if (qty < 0) {
                                            this.handleChange(0, item.key);
                                            return;
                                        }

                                        this.handleChange(qty, item.key);
                                    }}
                                />

                                <button type="button" className="btn btn-primary btn-sm btn-right" onClick={() => {
                                    if (getQtyItem(item.key) <= item.value.length) {
                                        this.handleChange(getQtyItem(item.key) + 1, item.key)
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