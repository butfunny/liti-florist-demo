import React from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManageProductModal} from "./manage-product-modal";
import readXlsxFile from "read-excel-file";
import isEqual from "lodash/isEqual";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {flowersApi} from "../../api/flowers-api";
import {customerApi} from "../../api/customer-api";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import sum from "lodash/sum";
import {formatNumber, getTotalBill} from "../../common/common";
import {premisesInfo} from "../../security/premises-info";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import sortBy from "lodash/sortBy";
import {ButtonGroup} from "../../components/button-group/button-group";

export class ProductsRoute extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            flowers: null,
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
                        this.refresh();
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
            flowersApi.removeFlower(row._id).then(() => {
                this.table.refresh();
            });
        })
    }


    render() {
        let {flowers, total} = this.state;

        let columns = [{
            label: "Mã SP",
            width: "15%",
            display: (row) => row.productID,
            sortKey: "productID",
            minWidth: "150"
        }, {
            label: "Tên",
            width: "25%",
            display: (row) => (
                <div className="product-name">
                    <img
                        src={row.image} alt=""/> {row.name}
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
                         marginRight: "5px"
                     }}
                />
            )),
            minWidth: "150"
        }, {
            label: "Giá Gốc",
            width: "10%",
            display: (row) => formatNumber(row.oriPrice),
            sortKey: "oriPrice",
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
                    click: () => this.remove(row)
                }]}
            />,
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
                                isDesc
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