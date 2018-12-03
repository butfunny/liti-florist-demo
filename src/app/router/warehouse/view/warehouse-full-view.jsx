import React from "react";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import {modals} from "../../../components/modal/modals";
import {EditWareHouseItemModal} from "../modals/edit-warehouse-item-modal";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {warehouseApi} from "../../../api/warehouse-api";
import {TransferItemModal} from "../modals/transfer-item-modal";
import {ReturnItemModal} from "../modals/return-item-modal";
import {permissionInfo} from "../../../security/premises-info";
import {userInfo} from "../../../security/user-info";
export class WareHouseFullView extends React.Component {

    constructor(props) {
        super(props);
    }

    editItem(updatedItems) {
        let {items, onChange} = this.props;

        let selectedItems = updatedItems.filter(i => !i.warehouseID);

        const modal = modals.openModal({
            content: (
                <EditWareHouseItemModal
                    updatedItems={selectedItems}
                    defaultItem={updatedItems[0]}
                    items={items}
                    onClose={() => {
                        onChange().then(() => {
                            modal.close();
                        });
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    removeItem(removedItems) {
        confirmModal.show({
            title: `Xoá sản phẩm ${removedItems[0].name}?`,
            description: "Bạn có đồng ý xoá sản phẩm này không?"
        }).then(() => {
            let {items, onChange} = this.props;
            const removedIds = removedItems.map(i => i._id);
            onChange(items.filter(p => removedIds.indexOf(p._id) == -1));
            warehouseApi.removeItems({ids: removedIds})
        })
    }

    render() {

        let {items} = this.props;
        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();

        return (
            <table className="table table-hover">
                <thead>
                <tr>
                    <th scope="col">Thông Tin</th>
                    <th scope="col">Danh Mục</th>
                    <th scope="col">Giá Gốc</th>
                    <th scope="col">Giá Bán</th>
                    <th scope="col">Đơn Vị Tính</th>
                    <th scope="col">Tác Vụ</th>
                </tr>
                </thead>
                <tbody>
                {items && keysToArray(groupBy(items, i => i.name)).map((item, index) => (
                    <tr key={index}>
                        <td>
                            {item.key} - {item.value[0].productId}

                            <div className="text-small">
                                <span className="text-danger">*Tồn kho:</span>

                                <div className="text-primary">
                                    <b>Kho tổng: {item.value.filter(i => !i.warehouseID).length}</b>

                                    <ul>
                                        { keysToArray(groupBy(item.value.filter(i => i.warehouseID), "warehouseID")).map((warehouseItem, index) => (
                                            <li
                                                className="padding-left"
                                                key={index}>
                                                <b>{warehouseItem.value[0].warehouseName}: {warehouseItem.value.length}</b>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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
                            {item.value[0].unit}
                        </td>
                        <td>

                            { permission[user.role].indexOf("warehouse.edit") > -1 && (
                                <button className="btn btn-outline-primary btn-sm"
                                        onClick={() => this.editItem(item.value)}>
                                    <i className="fa fa-pencil"/>
                                </button>
                            )}

                            { permission[user.role].indexOf("warehouse.remove") > -1 && (
                                <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => this.removeItem(item.value)}>
                                    <i className="fa fa-trash"/>
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
}