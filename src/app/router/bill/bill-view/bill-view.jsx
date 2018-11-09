import React from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import {InputNumber} from "../../../components/input-number/input-number";

export class BillView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bill, onChangeItems, editMode} = this.props;
        const items = bill.items;


        return (
            <div className="panel panel-default bill-view">
                <div className="panel-body">
                    <table className="table">
                        <colgroup>
                            <col width="150"/>
                            <col width="120"/>
                            <col width="120"/>
                            <col width="120"/>
                            <col width="75"/>
                            <col width="50"/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Tên</th>
                            <th className="text-right">SL</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-right">Giảm giá</th>
                            <th className="text-right">VAT</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>

                        { items.length == 0 && (
                            <tr>
                                <td colSpan={3}>
                                    Chưa có mặt hàng nào được chọn.
                                </td>
                            </tr>
                        )}

                        { items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {item.name}
                                </td>

                                <td className="no-padding col-action">

                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                        if (item.quantity == 1) {
                                            onChangeItems(items.filter(i => i.name != item.name))
                                        } else {
                                            onChangeItems(items.map(i => {
                                                if (i.name == item.name) return {...i, quantity: i.quantity - 1};
                                                return i;
                                            }))
                                        }

                                    }}>
                                        <i className="fa fa-minus"/>
                                    </button>

                                    <InputNumber
                                        disabled={editMode}
                                        autoSelect
                                        value={item.quantity}
                                        onChange={(quantity) => {
                                            onChangeItems(items.map(i => {
                                                if (i.name == item.name) return {...i, quantity};
                                                return i;
                                            }))
                                        }}
                                    />

                                    <button type="button" className="btn btn-primary btn-sm btn-right" onClick={() => {
                                        onChangeItems(items.map(i => {
                                            if (i.name == item.name) return {...i, quantity: i.quantity + 1};
                                            return i;
                                        }))
                                    }}>
                                        <i className="fa fa-plus"/>
                                    </button>

                                </td>

                                <td className="text-right">{formatNumber(item.price)}</td>

                                <td className="no-padding">
                                    <InputNumber
                                        maxVal={100}
                                        disabled={editMode}
                                        autoSelect
                                        value={item.discount || ""}
                                        onChange={(discount) => {
                                            if (discount <= 100) {
                                                onChangeItems(items.map(i => {
                                                    if (i.name == item.name) return {...i, discount};
                                                    return i;
                                                }))
                                            }
                                        }}
                                    />
                                </td>

                                <td className="no-padding">
                                    <InputNumber
                                        maxVal={100}
                                        disabled={editMode}
                                        autoSelect
                                        value={item.vat || ""}
                                        onChange={(vat) => {
                                            if (vat <= 100) {
                                                onChangeItems(items.map(i => {
                                                    if (i.name == item.name) return {...i, vat};
                                                    return i;
                                                }))
                                            }
                                        }}
                                    />
                                </td>

                                <td className="no-padding">
                                    { !editMode && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                                            onChangeItems(items.filter(i => i.name != item.name))
                                        }}>
                                            <i className="fa fa-trash"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        </tbody>

                    </table>

                </div>

                { bill.payOwe && bill.customerInfo && (
                    <div className="text-right">
                        Thanh toán nợ: <b>{formatNumber(bill.customerInfo.spend.totalOwe)}</b>
                    </div>
                )}

                { items.length > 0 && (
                    <div className="text-right">
                        Tổng Tiền: <b>{formatNumber(getTotalBill(bill))}</b>
                    </div>
                )}
            </div>
        );
    }
}