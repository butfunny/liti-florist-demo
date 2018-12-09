import React from "react";
import classnames from "classnames";
import {FloristItem} from "../florist-working-route/florist-item";
import {PreviewRequest} from "../warehouse/request-warehouse/preview-request";
import {Input} from "../../components/input/input";
import {Layout} from "../../components/layout/layout";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {warehouseApi} from "../../api/warehouse-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
export class CreateRequestMissing extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            items: [],
            filter: "All",
            keyword: "",
            selectedItems: [],
            noteType: "Hao Hụt",
            requestName: "",
            receivedName: "",
            loading: true,
            subWarehouseItems: []
        };

        premisesInfo.onChange(() => {
            this.setState({selectedItems: []});
        });

        warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
            this.setState({items: warehouseItems, subWarehouseItems, loading: false})
        })
    }

    submit(selectedItems) {
        let {noteType, requestName, receivedName} = this.state;
        const activePremise = premisesInfo.getActivePremise();
        warehouseApi.createRequestMissing({
            items: selectedItems,
            warehouseID: activePremise._id,
            requestName,
            receivedName,
            created: new Date(),
            type: noteType
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

        let {items, filter, keyword, selectedItems, noteType, requestName, receivedName, loading, subWarehouseItems} = this.state;
        const catalogs = ["All", "Hoa Chính", "Hoa Lá Phụ/Lá", "Phụ Kiện", "Cost"];
        const activePremise = premisesInfo.getActivePremise();

        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        const itemsWrapped = (c) => {
            let ret = subWarehouseItems.filter(i => i.warehouseID == activePremise._id).map((item => ({
                ...items.find(i => i._id == item.itemID),
                quantity: item.quantity
            })));

            return ret.filter(r => r.catalog == c)

        };

        return (
            <Layout
                activeRoute="Kho"
            >
                { permission[user.role].indexOf("warehouse.request-missing.create") == -1 ? (
                    <div>
                        Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                    </div>
                ) : (
                    <div className="request-warehouse florist-working-route">
                        <div className="ct-page-title">
                            <h1 className="ct-title">Phiếu báo cáo hoa Hoa Hụt hoặc Huỷ Hỏng</h1>
                        </div>

                        <div className="form-group">
                            <select className="form-control" value={noteType} onChange={(e) => {
                                this.setState({noteType: e.target.value})
                            }}>
                                <option value="Xuất kho">Hao Hụt</option>
                                <option value="Nhập kho">Huỷ Hỏng</option>
                            </select>
                        </div>

                        <div className="row">
                            <div className="col col-md-6">

                                <h6>Kho {activePremise.name}</h6>

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
                                    {loading && <span>Đang lấy dữ liệu chờ 1 chút...</span>}

                                    <div>
                                        { catalogs.slice(1).filter(c => filter == "All" ? true : c == filter).map((c, index) => (
                                            <FloristItem
                                                selectedItems={selectedItems}
                                                onChange={(selectedItems) => this.setState({selectedItems})}
                                                keyword={keyword}
                                                key={index}
                                                label={c}
                                                items={itemsWrapped(c)}
                                            />
                                        ))}
                                    </div>
                                </div>


                            </div>

                            <div className="col col-md-6">
                                <PreviewRequest
                                    selectedItems={selectedItems}
                                    items={items}
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
                )}
            </Layout>
        );
    }
}