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

        let {selectedItems} = this.props;

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

                            { sortBy(sortBy(keysToArray(groupBy(selectedItems, i => i.name)), i => i.key), i => {
                                if (i.value[0].catalog == "Hoa Chính") return 1;
                                if (i.value[0].catalog == "Hoa Lá Phụ/Lá") return 2;
                                if (i.value[0].catalog == "Phụ Kiện") return 3;
                                if (i.value[0].catalog == "Cost") return 4;
                            }).map((item, index) => (
                                <tr key={index}>
                                    <td className="title">
                                        {item.key}
                                    </td>

                                    <td className="price text-right">
                                        {formatNumber(item.value[0].price)}đ
                                    </td>


                                    <td className="no-padding col-action text-right">
                                        {item.value.length}
                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                    <div className="text-right">
                        Tổng tiền: {formatNumber(sumBy(selectedItems, i => i.price))}
                    </div>

                </div>



            </div>
        );
    }
}