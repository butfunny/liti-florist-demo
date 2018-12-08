import React from "react";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import {modals} from "../../../components/modal/modals";
import {ReturnItemModal} from "../modals/return-item-modal";
export class SubWareHouseView extends React.Component {

    constructor(props) {
        super(props);
    }




    render() {

        let {items, warehouseItems} = this.props;

        return (
            <table className="table table-hover">
                <thead>
                <tr>
                    <th scope="col">Thông Tin</th>
                    <th scope="col">Danh Mục</th>
                    <th scope="col">Giá Gốc</th>
                    <th scope="col">Giá Bán</th>
                    <th scope="col">Đơn Vị Tính</th>
                </tr>
                </thead>
                <tbody>
                {items && items.map((item, index) => {

                    let itemFound = warehouseItems.find(i => i._id == item.itemID);

                    return (
                        <tr key={index}>
                            <td>
                                {itemFound.name} - {itemFound.productId} - {item.quantity}
                            </td>
                            <td>
                                {itemFound.catalog}
                            </td>
                            <td>
                                {formatNumber(Math.round(itemFound.oriPrice))}
                            </td>
                            <td>
                                {formatNumber(Math.round(itemFound.price))}
                            </td>
                            <td>
                                {itemFound.unit}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        );
    }
}