import React from "react";
import {Layout} from "../../components/layout/layout";
import {warehouseApi} from "../../api/warehouse-api";
import {modals} from "../../components/modal/modals";
import {ManageWarehouseItemModal} from "./modals/manage-warehouse-item";
import {WareHouseFullView} from "./view/warehouse-full-view";
import {premisesInfo} from "../../security/premises-info";
import {SubWareHouseView} from "./view/sub-warehouse-view";
import {Input} from "../../components/input/input";

export class WarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            viewType: "",
            keyword: ""
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

        let {items, viewType, keyword} = this.state;
        const premises = premisesInfo.getPremises();

        const itemsFiltered = items.filter(i => i.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1);

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
                        <button type="button" className="btn btn-info" onClick={() => this.addItem()}>
                            Thêm Sản Phẩm
                        </button>
                    </div>

                    <div className="form-group">
                        <select
                            className="form-control"
                            value={viewType}
                            onChange={(e) => this.setState({viewType: e.target.value})}
                        >
                            <option value="">Kho Tổng</option>
                            { premises.map((p, index) => (
                                <option key={index} value={p._id}>Kho {p.name}</option>
                            ))}

                        </select>
                    </div>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm kiếm theo tên"
                        />
                    </div>

                    { viewType.length > 0 ? (
                        <SubWareHouseView
                            items={itemsFiltered.filter(i => i.warehouseID == viewType)}
                            onChange={(updatedItems) => {
                                this.setState({items: items.map(i => {
                                        let updatedItem = updatedItems.find(item => item._id == i._id);
                                        if (updatedItem) return updatedItem;
                                        return i;
                                })})
                            }}
                        />
                    ) : (
                        <WareHouseFullView
                            items={itemsFiltered}
                            onChange={(updatedItems) => this.setState({items: items.map(i => {
                                    let updatedItem = updatedItems.find(item => item._id == i._id);
                                    if (updatedItem) return updatedItem;
                                    return i;
                            })})}
                        />
                    )}



                </div>
            </Layout>
        );
    }
}