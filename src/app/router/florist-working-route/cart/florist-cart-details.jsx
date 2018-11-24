import React from "react";
import {InputNumber} from "../../../components/input-number/input-number";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
export class FloristCartDetails extends React.Component {

    constructor(props) {
        super(props);
    }

    handleChange(qty, name) {
        let {selectedItems, items, onChange} = this.props;
        const ret = selectedItems.filter(s => s.name != name);
        onChange(ret.concat(items.filter(c => c.name == name).slice(0, qty)))
    }

    render() {

        let {onClose, bill, selectedItems, items} = this.props;

        return (
            <div className="florist-cart-details">
                <div className="cart-title bg-gradient-primary">
                    {bill.bill_number}

                    <div className="close-btn" onClick={onClose}>
                        <i className="fa fa-close"/>
                    </div>
                </div>

                <div className="cart-body">
                    <div className="bill-info bg-secondary">
                        { bill.items.map((item, index) => (
                            <div key={index}>
                                <b>{item.quantity}</b> {item.name}
                            </div>
                        ))}
                    </div>


                    { sortBy(sortBy(keysToArray(groupBy(selectedItems, i => i.name)), i => i.key), i => {
                        if (i.value[0].catalog == "Hoa Chính") return 1;
                        if (i.value[0].catalog == "Hoa Lá Phụ/Lá") return 2;
                        if (i.value[0].catalog == "Phụ Kiện") return 3;
                        if (i.value[0].catalog == "Cost") return 4;
                    }).map((item, index) => (
                        <div className="product" key={index}>
                            <div className="title">
                                {item.key}
                            </div>

                            <div className="price">
                                {formatNumber(item.value[0].price)}đ
                            </div>

                            <div className="qty">
                                Tồn kho: <b>{items.filter(c => c.name == item.key).length}</b>
                            </div>

                            <div className="action">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                    this.handleChange(item.value.length - 1, item.key);
                                }}>
                                    <i className="fa fa-minus"/>
                                </button>

                                <InputNumber
                                    autoSelect
                                    value={item.value.length}
                                    onChange={(qty) => {
                                        if (qty > items.filter(c => c.name == item.key).length) {
                                            this.handleChange(items.filter(c => c.name == item.key).length, item.key);
                                            return;
                                        }

                                        if (qty <= 0) {
                                            this.handleChange(0, item.key);
                                            return;
                                        }

                                        this.handleChange(qty, item.key);
                                    }}
                                />

                                <button type="button" className="btn btn-info btn-sm btn-right" onClick={() => {
                                    if (item.value.length <= items.filter(c => c.name == item.key).length) {
                                        this.handleChange(item.value.length + 1, item.key)
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