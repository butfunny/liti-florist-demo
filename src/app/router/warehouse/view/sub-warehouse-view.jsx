import React from "react";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import {modals} from "../../../components/modal/modals";
import {ReturnItemModal} from "../modals/return-item-modal";
export class SubWareHouseView extends React.Component {

    constructor(props) {
        super(props);
    }

    returnItem(returnItems) {
        const modal = modals.openModal({
            content: (
                <ReturnItemModal
                    items={returnItems}
                    onDismiss={() => modal.close()}
                    onClose={(updatedItems) => {
                        let {items, onChange} = this.props;
                        onChange(items.map(i => {
                            let updatedItem = updatedItems.find(item => item._id == i._id);
                            if (updatedItem) return updatedItem;
                            return i;
                        }));
                        modal.close();
                    }}
                />
            )
        })
    }


    render() {

        let {items} = this.props;

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
                {items && keysToArray(groupBy(items, i => i.name)).map((item, index) => (
                    <tr key={index}>
                        <td>
                            {item.key} - {item.value[0].productId} - {item.value.length}
                        </td>
                        <td>
                            {item.value[0].catalog}
                        </td>
                        <td>
                            {formatNumber(Math.floor(item.value[0].oriPrice))}
                        </td>
                        <td>
                            {formatNumber(Math.floor(item.value[0].price))}
                        </td>
                        <td>
                            {formatNumber(Math.floor(item.value[0].unit))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
}