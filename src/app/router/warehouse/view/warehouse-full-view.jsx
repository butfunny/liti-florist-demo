import React from "react";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import {modals} from "../../../components/modal/modals";
import {EditWareHouseItemModal} from "../modals/edit-warehouse-item-modal";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {warehouseApi} from "../../../api/warehouse-api";
import {TransferItemModal} from "../modals/transfer-item-modal";
import {ReturnItemModal} from "../modals/return-item-modal";
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
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

        let {items, subWarehouseItems} = this.props;
        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();
        const premises = premisesInfo.getPremises();

        const getSubItem = (item) => {
            let subItems =  subWarehouseItems.filter(i => i.itemID == item._id);
            const premiseActive = premises.filter(p => subItems.map(s => s.warehouseID).indexOf(p._id) > -1);
            return premiseActive.map(p => ({
                name: p.name,
                quantity: subItems.find(i => i.warehouseID == p._id).quantity
            }))
        };


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
                {items && items.map((item, index) => (
                    <tr key={index}>
                        <td>
                            {item.name} - {item.productId}

                            <div className="text-small">
                                <span className="text-danger">*Tồn kho:</span>

                                <div className="text-primary">
                                    <b>Kho tổng: {item.quantity}</b>

                                    <ul>
                                        { getSubItem(item).map((warehouseItem, index) => (
                                            <li
                                                className="padding-left"
                                                key={index}>
                                                <b>{warehouseItem.name}: {warehouseItem.quantity}</b>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>
                            {item.catalog}
                        </td>
                        <td>
                            {formatNumber(Math.floor(item.oriPrice))}
                        </td>
                        <td>
                            {formatNumber(Math.floor(item.price))}
                        </td>

                        <td>
                            {item.unit}
                        </td>
                        <td>

                            { permission[user.role].indexOf("warehouse.edit") > -1 && (
                                <button className="btn btn-outline-primary btn-sm"
                                        onClick={() => this.editItem(item)}>
                                    <i className="fa fa-pencil"/>
                                </button>
                            )}

                            {/*{ permission[user.role].indexOf("warehouse.remove") > -1 && (*/}
                                {/*<button className="btn btn-outline-danger btn-sm"*/}
                                        {/*onClick={() => this.removeItem(item)}>*/}
                                    {/*<i className="fa fa-trash"/>*/}
                                {/*</button>*/}
                            {/*)}*/}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
}