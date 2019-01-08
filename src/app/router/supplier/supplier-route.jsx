import React from "react";
import {Layout} from "../../components/layout/layout";
import {SelectColor} from "../../components/select-color/select-color";
import {DataTable} from "../../components/data-table/data-table";
import {Input} from "../../components/input/input";
import {productApi} from "../../api/product-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {ButtonGroup} from "../../components/button-group/button-group";
import {modals} from "../../components/modal/modals";
import {EditSupplierModal} from "./edit-supplier-modal";

export class SupplierRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            supplier: "",
            suppliers: [],
            error: false
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    addSupplier() {
        let {suppliers, supplier} = this.state;
        this.setState({adding: true});
        productApi.createSupplier({name: supplier}).then((newSupplier) => {
            if (newSupplier.error) {
                this.setState({error: true, adding: false})
            } else {
                this.setState({adding: false, suppliers: suppliers.concat(newSupplier)})
            }
        });
    }

    edit(row) {
        let {suppliers} = this.state;
        const modal = modals.openModal({
            content: (
                <EditSupplierModal
                    supplier={row}
                    onDismiss={() => modal.close()}
                    onClose={(supplier) => {
                        this.setState({suppliers: suppliers.map(s => s._id == supplier._id ? supplier : s)});
                        modal.close();
                    }}
                />
            )
        })
    }

    removeType(row) {
        confirmModal.show({
            title: "Xóa nhà cung cấp này?",
            description: "Bạn có đồng ý muốn xóa nhà cung cấp này không?"
        }).then(() => {
            productApi.removeSupplier(row._id);
            let {suppliers} = this.state;
            this.setState({suppliers: suppliers.filter(c => c.name != row.name)});
        })
    }

    render() {

        let columns = [{
            label: "Nhà Cung Cấp",
            width: "95%",
            display: (row) => <div className="type-name">{row.name}</div>,
            minWidth: "150"
        }, {
            label: "",
            width: "5%",
            display: (row) => <ButtonGroup
                actions={[{
                    name: "Sửa",
                    icon: <i className="fa fa-pencil"/>,
                    click: () => this.edit(row)
                }, {
                    name: "Xóa",
                    icon: <i className="fa fa-trash text-danger"/>,
                    click: () => this.removeType(row)
                }]}
            />,
            className: "number content-menu-action",
            minWidth: "60"
        }];

        let {supplier, suppliers, adding} = this.state;

        return (
            <Layout
                activeRoute="Quản Lý Nhà Cung Cấp"
            >
                <div className="setting-route">
                    <div className="card">
                        <div className="card-title">
                            Nhà Cung Cấp
                        </div>

                        <div className="select-color-action">
                            <Input
                                onKeyDown={(e) => e.key == "Enter" && supplier.length > 0 && suppliers.map(c => c.name).indexOf(supplier) == -1 && this.addSupplier()}
                                label="Tên Nhà Cung Cấp"
                                value={supplier}
                                onChange={(e) => this.setState({supplier: e.target.value})}
                                error={suppliers.map(c => c.name).indexOf(supplier) > -1 ? "Trùng loại" : false}
                            />

                            <button className="btn btn-primary"
                                    disabled={supplier.length == 0 || suppliers.map(c => c.name).indexOf(supplier) > -1}
                                    onClick={() => this.addType()}>
                                    <span className="btn-text">
                                        Thêm
                                    </span>

                                { adding && (
                                    <span className="loading-icon">
                                        <i className="fa fa-spinner fa-pulse"/>
                                    </span>
                                ) }
                            </button>
                        </div>

                        <DataTable
                            columns={columns}
                            rows={suppliers}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}