import React from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import {InputNumber} from "../../../components/input-number/input-number";

export class BillView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {items, onChangeItems, editMode} = this.props;


        return (
            <div className="panel panel-default bill-view">
                <div className="panel-body">
                    <table className="table">
                        <colgroup>
                            <col width="150"/>
                            <col width="120"/>
                            <col width="120"/>
                            <col width="120"/>
                            <col width="50"/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Tên</th>
                            <th className="text-right">Số Lượng</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-right">Giảm giá(%)</th>
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

                                <td className="no-padding">
                                    <InputNumber
                                        disabled={editMode}
                                        autoSelect
                                        value={item.qty}
                                        onChange={(qty) => {
                                            onChangeItems(items.map(i => {
                                                if (i.name == item.name) return {...i, qty};
                                                return i;
                                            }))
                                        }}
                                    />
                                </td>

                                <td className="text-right">{formatNumber(item.price)}</td>

                                <td className="no-padding">
                                    <InputNumber
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

                { items.length > 0 && (
                    <div className="text-right">
                        Tổng Tiền: <b>{formatNumber(getTotalBill(items))}</b>
                    </div>
                )}
            </div>
        );
    }
}