import React from "react";
import {InputNumber} from "../../../components/input-number/input-number";
import {formatNumber} from "../../../common/common";
export class FloristCartDetails extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {onClose, bill} = this.props;

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

                    <div className="product">
                        <div className="title">
                            Hoa Súng
                        </div>

                        <div className="price">
                            100000đ
                        </div>

                        <div className="qty">
                            Tồn kho: <b>40</b>
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
                </div>
            </div>
        );
    }
}