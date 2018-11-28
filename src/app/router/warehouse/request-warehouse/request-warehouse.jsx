import React from "react";
import {Layout} from "../../../components/layout/layout";
import {warehouseApi} from "../../../api/warehouse-api";
import classnames from "classnames";
import {FloristItem} from "../../florist-working-route/florist-item";
import {premisesInfo} from "../../../security/premises-info";
import {PreviewRequest} from "./preview-request";
import {Input} from "../../../components/input/input";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {RComponent} from "../../../components/r-component/r-component";
export class RequestWareHouse extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            filter: "All",
            keyword: "",
            selectedItems: [],
            noteType: "Xuất kho",
            requestName: "",
            receivedName: ""
        };

        premisesInfo.onChange(() => {
            this.setState({selectedItems: []});
        });

        warehouseApi.getItems().then((items) => {
            this.setState({items: items})
        })
    }

    submit(selectedItems) {
        let {noteType, requestName, receivedName} = this.state;
        const activePremise = premisesInfo.getActivePremise();
        warehouseApi.createRequest({
            items: selectedItems,
            toWarehouse: noteType == "Xuất kho" ? activePremise._id : null,
            requestName,
            receivedName,
            fromWarehouse: noteType == "Xuất kho" ? null : activePremise._id,
            created: new Date()
        }).then(() => {
            confirmModal.alert("Gửi phiếu thành công");
            this.setState({
                selectedItems: [],
                requestName: "",
                receivedName: ""
            })
        })
    }

    render() {

        let {items, filter, keyword, selectedItems, noteType, requestName, receivedName} = this.state;
        const catalogs = ["All", "Hoa Chính", "Hoa Lá Phụ/Lá", "Phụ Kiện", "Cost"];
        const activePremise = premisesInfo.getActivePremise();

        return (
            <Layout
                activeRoute="Kho"
            >
                <div className="request-warehouse florist-working-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Phiếu yêu cầu XNK</h1>
                    </div>

                    <div className="form-group">
                        <select className="form-control" value={noteType} onChange={(e) => {
                            this.setState({noteType: e.target.value, selectedItems: []})
                        }}>
                            <option value="Xuất kho">Xuất kho</option>
                            <option value="Nhập kho">Nhập kho</option>
                        </select>
                    </div>

                    <div className="row">
                        <div className="col col-md-6">

                            <h6>{noteType == "Xuất kho" ? "Kho tổng" : `Kho ${activePremise.name}`}</h6>

                            <div className="catalog-list">

                                { catalogs.map((c, index) => (
                                    <div className={classnames("catalog-item", c == filter && "text-primary")}
                                         onClick={() => this.setState({filter: c})}
                                         key={index}>
                                        {c}
                                    </div>
                                ))}

                            </div>

                            <div className="search-item">
                                <input className="form-control"
                                       value={keyword}
                                       onChange={(e) => this.setState({keyword: e.target.value})}
                                       placeholder="Tìm"/>
                            </div>

                            <div className="product-list">

                                { catalogs.slice(1).filter(c => filter == "All" ? true : c == filter).map((c, index) => (
                                    <FloristItem
                                        selectedItems={selectedItems}
                                        onChange={(selectedItems) => this.setState({selectedItems})}
                                        keyword={keyword}
                                        key={index}
                                        label={c}
                                        items={items.filter(i => i.catalog == c && (noteType == "Xuất kho" ? !i.warehouseID : i.warehouseID == activePremise._id))}
                                    />
                                ))}

                            </div>


                        </div>

                        <div className="col col-md-6">
                            <PreviewRequest
                                items={items.filter(i =>  noteType == "Xuất kho" ? !i.warehouseID : i.warehouseID == activePremise._id)}
                                selectedItems={selectedItems}
                                onChange={(selectedItems) => this.setState({selectedItems})}
                            />

                            <Input
                                value={requestName}
                                onChange={(e) => this.setState({requestName: e.target.value})}
                                label="Người lập phiếu"
                            />

                            <Input
                                value={receivedName}
                                onChange={(e) => this.setState({receivedName: e.target.value})}
                                label="Người xác nhận phiếu"
                            />

                            <button type="button"
                                    disabled={selectedItems.length == 0 || requestName.length == 0 || receivedName.length == 0}
                                    className="btn btn-info btn-icon"
                                    onClick={() => this.submit(selectedItems)}>
                                <span className="btn-inner--text">Xác Nhận</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}