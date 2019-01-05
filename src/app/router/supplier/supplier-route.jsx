import React from "react";
import {Layout} from "../../components/layout/layout";
import {SelectColor} from "../../components/select-color/select-color";
import {DataTable} from "../../components/data-table/data-table";
import {Input} from "../../components/input/input";
import {productApi} from "../../api/product-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";

export class SupplierRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            supplier: "",
            suppliers: []
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    addSupplier() {
        let {suppliers, supplier} = this.state;
        this.setState({adding: true});
        productApi.createSupplier({name: supplier}).then(() => {
            this.setState({adding: false});
            this.setState({suppliers: suppliers.concat({name: supplier}), supplier: ""})
        });
    }

    removeType(row) {
        confirmModal.show({
            title: "Xóa nhà cung cấp này?",
            description: "Bạn có đồng ý muốn xóa nhà cung cấp này không?"
        }).then(() => {
            productApi.removeSupplier(row.name);
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
            display: (row) => <div className="text-right">
                <button className="btn btn-danger btn-small" onClick={() => this.removeType(row)}><i
                    className="fa fa-trash"/></button>
            </div>,
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

                                {adding && (
                                    <span className="loading-icon">
                                    <i className="fa fa-spinner fa-pulse"/>
                                </span>
                                )}
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