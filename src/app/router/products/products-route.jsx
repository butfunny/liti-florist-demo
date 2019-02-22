import React from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManageProductModal} from "./manage-product-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {flowersApi} from "../../api/flowers-api";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import {formatNumber, getTotalBill} from "../../common/common";
import {ButtonGroup} from "../../components/button-group/button-group";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {SelectTags} from "../../components/select-tags/select-tags";
import {catalogs} from "../../common/constance";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {security} from "../../security/secuiry-fe";

export class ProductsRoute extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            flowers: null,
            filteredColors: [],
            filteredTypes: []
        };

    }

    addProduct() {
        const modal = modals.openModal({
            content: (
                <ManageProductModal
                    product={{
                        catalog: "Hoa Chính",
                        oriPrice: 0,
                        price: 0
                    }}
                    onDismiss={() => modal.close()}
                    onClose={() => {
                        modal.close();
                        this.table.refresh();
                    }}
                />
            )
        })
    }

    edit(row) {
        const modal = modals.openModal({
            content: (
                <ManageProductModal
                    product={row}
                    onDismiss={() => modal.close()}
                    onClose={() => {
                        modal.close();
                        this.table.refresh();
                    }}
                />
            )
        })
    }

    remove(row) {
        confirmModal.show({
            title: "Xóa sản phẩm này?",
            description: "Bạn có đồng ý muốn xóa sản phẩm này không?"
        }).then(() => {
            flowersApi.removeFlower(row._id).then((resp) => {
                if (resp && resp.error) {
                    confirmModal.alert("Không thể xóa sản phẩm vì sản phẩm đang được sử dụng ở nơi khác");
                } else {
                    this.table.refresh();
                }
            });
        })
    }


    render() {
        let {flowers, total, filteredColors, filteredTypes} = this.state;

        let columns = [{
            label: "Mã SP",
            width: "10%",
            display: (row) => row.productID,
            sortKey: "productID",
            minWidth: "150"
        }, {
            label: "Tên",
            width: "25%",
            display: (row) => (
                <div className="product-name">
                    <ImgPreview src={row.image}/> {row.name}
                </div>
            ),
            sortKey: "name",
            minWidth: "250"
        }, {
            label: "Loại",
            width: "15%",
            display: (row) => row.catalog,
            sortKey: "catalog",
            minWidth: "150"
        }, {
            label: "Màu",
            width: "15%",
            display: (row) => row.colors.map((color, index) => (
                <div key={index}
                     style={{
                         background: color,
                         height: "15px",
                         width: "25px",
                         display: "inline-block",
                         marginRight: "5px",
                         border: "1px solid #dedede"
                     }}
                />
            )),
            minWidth: "150"
        }, {
            label: "Giá Gốc",
            width: "10%",
            display: (row) => security.isHavePermission(["warehouse.view-ori-price"]) && formatNumber(row.oriPrice),
            sortKey: security.isHavePermission(["warehouse.view-ori-price"]) && "oriPrice",
            minWidth: "100"
        }, {
            label: "Giá Bán",
            width: "10%",
            display: (row) => formatNumber(row.price),
            sortKey: "price",
            minWidth: "100"
        }, {
            label: "DVT",
            width: "5%",
            display: (row) => row.unit,
            minWidth: "50",
            sortKey: "unit",
        }, {
            label: "Dài",
            width: "5%",
            display: (row) => row.lengthiness,
            minWidth: "50",
            sortKey: "lengthiness",
        }, {
            label: "",
            width: "5%",
            display: (row) => security.isHavePermission(["warehouse.products.update"]) && (
                <ButtonGroup
                    actions={[{
                        name: "Sửa",
                        icon: <i className="fa fa-pencil"/>,
                        click: () => this.edit(row)
                    }, {
                        name: "Xóa",
                        icon: <i className="fa fa-trash text-danger"/>,
                        click: () => this.remove(row)
                    }]}
                />
            ),
            minWidth: "50"
        }];


        return (
            <Layout
                activeRoute="Danh Sách Sản Phẩm"
            >
                <div className="products-route card">
                    <div className="card-title">
                        Sản Phẩm
                    </div>

                    <div className="card-body">
                        <button type="button" className="btn btn-primary" onClick={() => this.addProduct()}>Thêm Sản
                            Phẩm
                        </button>

                        <div className="filter-wrapper">
                            <div className="filter-col">
                                <SelectTagsColor
                                    label="Lọc Theo Màu"
                                    tags={filteredColors}
                                    onChange={(filteredColors) => this.setState({filteredColors}, () => this.table.reset())}
                                />
                            </div>

                            <div className="filter-col">
                                <SelectTags
                                    label="Lọc Theo Loại"
                                    tags={filteredTypes}
                                    onChange={(filteredTypes) => this.setState({filteredTypes}, () => this.table.reset())}
                                    list={catalogs}
                                    placeholder="Chọn Loại"
                                />
                            </div>
                        </div>
                    </div>

                    <PaginationDataTable
                        ref={elem => this.table = elem}
                        total={total}
                        columns={columns}
                        rows={flowers}
                        api={({keyword, page, sortKey, isDesc}) => {
                            return flowersApi.getFlowers({
                                keyword,
                                skip: (page - 1) * 15,
                                sortKey,
                                isDesc,
                                filteredColors,
                                filteredTypes
                            }).then(({flowers, total}) => {
                                this.setState({flowers, total});
                                return Promise.resolve();
                            })
                        }}
                    />
                </div>
            </Layout>
        );
    }
}