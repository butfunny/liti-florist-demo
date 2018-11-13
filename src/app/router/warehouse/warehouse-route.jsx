import React from "react";
import {Layout} from "../../components/layout/layout";
import groupBy from "lodash/groupBy";
import {warehouseApi} from "../../api/warehouse-api";
import {modals} from "../../components/modal/modals";
import {ManageWarehouseItemModal} from "./manage-warehouse-item";
import {formatNumber, keysToArray} from "../../common/common";

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

    render() {

        let {items} = this.state;


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
                            <th scope="col">Tên - Số Lượng</th>
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
                                    {item.key} - {item.value.length}
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
                                    Tac uv
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