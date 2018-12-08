import React from "react";
import {InputNumber} from "../../../components/input-number/input-number";
import {formatNumber, getTotalBill, keysToArray} from "../../../common/common";
import sortBy from "lodash/sortBy";
import groupBy from "lodash/groupBy";
import sumBy from "lodash/sumBy";
export class PreviewRequest extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {selectedItems, items} = this.props;

        const getTotal = () => {
            let price = 0;
            for (let item of selectedItems) {
                let itemFound = items.find(i => i._id == item.itemID);
                price += itemFound.price * item.quantity;
            }

            return price;
        };

        return (
            <div className="panel panel-default bill-view">
                <div className="panel-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Tên</th>
                            <th className="text-right">Đơn Giá</th>
                            <th className="text-right">SL</th>
                        </tr>
                        </thead>
                        <tbody>

                            {selectedItems.length == 0 && (
                                <tr>
                                    <td colSpan={3}>
                                        Chưa có mặt hàng nào được chọn.
                                    </td>
                                </tr>
                            )}

                            { selectedItems.map((item, index) => {
                                const itemFound = items.find(i => i._id == item.itemID);
                                return (
                                    <tr key={index}>
                                        <td className="title">
                                            {itemFound.name}
                                        </td>

                                        <td className="price text-right">
                                            {formatNumber(itemFound.price)}đ
                                        </td>


                                        <td className="no-padding col-action text-right">
                                            {item.quantity}
                                        </td>
                                    </tr>
                                )
                            })}

                        </tbody>

                    </table>

                    <div className="text-right">
                        Tổng tiền: {formatNumber(getTotal())}
                    </div>

                </div>



            </div>
        );
    }
}