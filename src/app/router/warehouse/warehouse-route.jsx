import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {warehouseApi} from "../../api/warehouse-api";
import {modals} from "../../components/modal/modals";
import {ManageWarehouseItemModal} from "./modals/manage-warehouse-item";
import {WareHouseFullView} from "./view/warehouse-full-view";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {SubWareHouseView} from "./view/sub-warehouse-view";
import {Input} from "../../components/input/input";
import {userInfo} from "../../security/user-info";
import {Checkbox} from "../../components/checkbox/checkbox";
import moment from "moment";
import {CSVLink} from "react-csv";
import readXlsxFile from 'read-excel-file'
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import isEqual from "lodash/isEqual"
import {generateDatas} from "../../common/common";
import {uploadApi} from "../../api/upload-api";
export class WarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            viewType: "",
            keyword: "",
            loading: true
        };

        warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
            this.setState({items: warehouseItems, subWarehouseItems, loading: false})
        })

    }


    refresh() {
        return warehouseApi.getItems().then((items) => {
            this.setState({items});
            return Promise.resolve();
        });
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


    handleChangeInput(e) {
        if (e.target.files[0]) {
            readXlsxFile(e.target.files[0]).then((rows) => {
                if (rows[0] && isEqual(["Mã", "Tên hàng", "Danh mục", "Đơn vị tính", "Số lượng", "Giá gốc", "Giá bán"], rows[0])) {
                    this.setState({uploading: true});

                    const upload = (index) => {
                        if (index == rows.length - 1) {
                            this.setState({uploading: false});
                            confirmModal.alert(`Thêm thành công ${rows.length - 1} sản phẩm`);
                            warehouseApi.getItems().then((items) => {
                                this.setState({items})
                            })
                        } else {
                            let item = rows[index];
                            warehouseApi.createItem({
                                productId: item[0],
                                name: item[1],
                                catalog: item[2],
                                unit: item[3],
                                oriPrice: item[5],
                                price: item[6],
                                quantity: item[4]
                            }).then(() => {
                                upload(index + 1)
                            })
                        }
                    };

                    upload(1);

                } else {
                    confirmModal.alert("Sai định dạng file");
                }
            })
        }
    }

    render() {

        let {items, viewType, keyword, uploading, loading, subWarehouseItems} = this.state;
        const premises = premisesInfo.getPremises();

        const itemsFiltered = items.filter(i => i.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();

        return (
            <Layout
                activeRoute="Kho"
            >
                { (permission[user.role].indexOf("warehouse.view") == -1 && permission[user.role].indexOf("warehouse.create") == -1) && permission[user.role].indexOf("warehouse.edit") == -1 && permission[user.role].indexOf("warehouse.edit") == -1 ? (
                    <div>
                        Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                    </div>
                ) : (
                    <div className="warehouse-route manage-premises-route">
                        <div className="ct-page-title">
                            <h1 className="ct-title">Quản Lý Kho</h1>
                            <div className="avatar-group mt-3">
                            </div>
                        </div>
                        <hr/>

                        { permission[user.role].indexOf("warehouse.create") > -1 && (
                            <div className="margin-bottom">
                                <button type="button" className="btn btn-info btn-sm"  onClick={() => this.addItem()}>
                                    Thêm Sản Phẩm
                                </button>

                                <button
                                    disabled={uploading}
                                    onClick={() => this.excel.click()}
                                    className="btn btn-primary btn-icon btn-excel btn-sm">
                                    <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                                    <span className="btn-inner--text">Thêm Bằng File Excel</span>
                                    { uploading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>

                                <input type="file"
                                       accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                       ref={input => this.excel = input}
                                       onChange={(e) => this.handleChangeInput(e)}
                                       style={{display: "none"}} />
                            </div>
                        )}


                        { permission[user.role].indexOf("warehouse.view") > -1 && (
                            <Fragment>
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

                                { loading && "Đang tải...."}

                                { viewType.length > 0 ? (
                                    <SubWareHouseView
                                        warehouseItems={items}
                                        items={subWarehouseItems.filter(i => i.warehouseID == viewType)}
                                    />
                                ) : (
                                    <WareHouseFullView
                                        items={itemsFiltered}
                                        onChange={() => this.refresh()}
                                        subWarehouseItems={subWarehouseItems}
                                    />
                                )}
                            </Fragment>
                        )}



                    </div>
                )}

            </Layout>
        );
    }
}