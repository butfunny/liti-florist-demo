import React from "react";
import {Layout} from "../../components/layout/layout";
import groupBy from "lodash/groupBy";
import {warehouseApi} from "../../api/warehouse-api";
import {modals} from "../../components/modal/modals";
import {ManageWarehouseItemModal} from "./manage-warehouse-item";
import {formatNumber, keysToArray} from "../../common/common";
import {EditWareHouseItemModal} from "./edit-warehouse-item-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {securityApi} from "../../api/security-api";
import {TransferItemModal} from "./transfer-item-modal";
import {ReturnItemModal} from "./return-item-modal";

export class WarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: null
        };

        warehouseApi.getItems().then((items) => {
            this.setState({items})
        })

    }


    addItem() {
        let {items} = this.state;

        const modal = modals.openModal({
            content: (
                <ManageWarehouseItemModal
                    items={items}
                    onClose={(newItems) => {
                        let {items} = this.state;
                        this.setState({items: items.concat(newItems)});
                        modal.close();
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    editItem(updatedItems) {
        let {items} = this.state;

        const modal = modals.openModal({
            content: (
                <EditWareHouseItemModal
                    updatedItems={updatedItems}
                    items={items}
                    onClose={(updatedItems) => {
                        this.setState({items: updatedItems});
                        modal.close();
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
            let {items} = this.state;
            const removedIds = removedItems.map(i => i._id);
            this.setState({
                items: items.filter(p => removedIds.indexOf(p._id) == -1)
            });
            warehouseApi.removeItems({ids: removedIds})
        })
    }

    transferItem(transferItems) {
        const modal = modals.openModal({
            content: (
                <TransferItemModal
                    items={transferItems}
                    onDismiss={() => modal.close()}
                    onClose={(updatedItems) => {
                        let {items} = this.state;
                        this.setState({items: items.map(i => {
                            let updatedItem = updatedItems.find(item => item._id == i._id);
                            if (updatedItem) return updatedItem;
                            return i;
                        })});
                        modal.close();
                    }}
                />
            )
        })
    }

    returnItem(returnItems) {
        const modal = modals.openModal({
            content: (
                <ReturnItemModal
                    items={returnItems}
                    onDismiss={() => modal.close()}
                    onClose={(updatedItems) => {
                        let {items} = this.state;
                        this.setState({items: items.map(i => {
                                let updatedItem = updatedItems.find(item => item._id == i._id);
                                if (updatedItem) return updatedItem;
                                return i;
                            })});
                        modal.close();
                    }}
                />
            )
        })
    }

    render() {

        let {items} = this.state;

        const generateWarehouseItem = (item) => {

        };

        return (
            <Layout
                activeRoute="Kho"
            >
                <div className="warehouse-route manage-premises-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Quản Lý Kho</h1>
                        <div className="avatar-group mt-3">
                        </div>
                    </div>
                    <hr/>
                    <div className="margin-bottom">
                        <button type="button" className="btn btn-primary" onClick={() => this.addItem()}>
                            Thêm Sản Phẩm
                        </button>
                    </div>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Thông Tin</th>
                            <th scope="col">Danh Mục</th>
                            <th scope="col">Giá Gốc</th>
                            <th scope="col">Giá Bán</th>
                            <th scope="col">Tác Vụ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items && keysToArray(groupBy(items, i => i.name)).map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {item.key}

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

                                                        <button className="btn btn-outline-danger btn-sm"
                                                                style={{marginLeft: "10px"}}
                                                                onClick={() => this.returnItem(warehouseItem.value)}>
                                                            <i className="fa fa-share"/>
                                                        </button>
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
                                    {formatNumber(item.value[0].oriPrice)}
                                </td>
                                <td>
                                    {formatNumber(item.value[0].price)}
                                </td>
                                <td>
                                    <button className="btn btn-outline-success btn-sm"
                                            onClick={() => this.transferItem(item.value.filter(i => !i.warehouseID))}>
                                        <i className="fa fa-truck"/>
                                    </button>
                                    <button className="btn btn-outline-primary btn-sm"
                                            onClick={() => this.editItem(item.value.filter(i => !i.warehouseID))}>
                                        <i className="fa fa-pencil"/>
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm"
                                            onClick={() => this.removeItem(item.value)}>
                                        <i className="fa fa-trash"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Layout>
        );
    }
}