import React from "react";
import {InputNumber} from "../../components/input-number/input-number";
import {formatNumber, keysToArray} from "../../common/common";
import groupBy from "lodash/groupBy";
export class FloristItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {label, items, className, keyword} = this.props;

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
                                }}>
                                    <i className="fa fa-minus"/>
                                </button>

                                <InputNumber
                                    autoSelect
                                    value={1}
                                    onChange={(quantity) => {

                                    }}
                                />

                                <button type="button" className="btn btn-primary btn-sm btn-right" onClick={() => {

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