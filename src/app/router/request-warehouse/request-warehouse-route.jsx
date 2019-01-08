import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {ButtonGroup} from "../../components/button-group/button-group";
import {customerApi} from "../../api/customer-api";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import {warehouseApi} from "../../api/warehouse-api";
import moment from "moment";
import {productApi} from "../../api/product-api";
import {formatNumber} from "../../common/common";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../components/img-repview/img-preview";



export class RequestWarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            requests: null,
            total: 0,
            suppliers: [],
            flowers: []
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    render() {

        let {history} = this.props;

        let {requests, total, suppliers, flowers} = this.state;

        let columns = [{
            label: "Thời gian",
            width: "20%",
            display: (row) => moment(row.created).format("DD/MM/YYYY hh:mm"),
            minWidth: "100",
            sortKey: "created"
        }, {
            label: "Kiểu",
            width: "25%",
            display: (row) => {
                const requestTypesRender = {
                    "request-from-supplier": () => <span><i className="fa fa-arrow-right text-primary" aria-hidden="true"/> Nhập từ <b className="text-primary">{suppliers.find(s => s._id == row.supplierID).name}</b></span>
                };

                return requestTypesRender[row.requestType]();
            },
            minWidth: "150",
            sortKey: "type"
        }, {
            label: "Sản phẩm",
            width: "35%",
            display: (row) => row.items.map((item, index) => {
                let product = flowers.find(f => f._id == item.parentID);

                return (
                    <ColumnViewMore
                        key={index}
                        header={
                            <div className="product-name">
                                <ImgPreview src={product.image}/> {item.quantity} - {product.name}
                            </div>
                        }
                        renderViewMoreBody={() => (
                            <Fragment>
                                <div className="info-item">
                                    Màu:
                                    {product.colors.map((color, index) => (
                                        <div key={index}
                                             style={{
                                                 background: color,
                                                 height: "15px",
                                                 width: "25px",
                                                 display: "inline-block",
                                                 marginLeft: "5px"
                                             }}
                                        />
                                    ))}
                                </div>

                                <div className="info-item">
                                    Đơn Vị Tính: {product.unit}
                                </div>

                                { product.lengthiness && (
                                    <div className="info-item">
                                        Chiều Dài Cành Hoa: {product.lengthiness}
                                    </div>
                                )}
                            </Fragment>
                        )}
                        viewMoreText="Chi Tiết"
                        subText={<div>{product.productID} - {product.catalog}</div>}
                        isShowViewMoreText
                    />
                )
            }),
            minWidth: "300",
        }, {
            label: "Trạng Thái",
            width: "15%",
            display: (row) => "Nhập Hàng",
            minWidth: "150"
        }, {
            label: "",
            width: "5%",
            display: (row) => "Nhập Hàng",
            minWidth: "150"
        }];


        return (
            <Layout
                activeRoute="Phiếu Xuất Nhập Kho"
            >
                <div className="request-warehouse-route">
                    <div className="card">
                        <div className="card-title">
                            Phiếu Xuất Nhập Kho
                        </div>

                        <div className="card-body">
                            <ButtonGroup
                                className="btn btn-primary"
                                customText="Thêm Phiếu"
                                actions={[{
                                    icon: <i className="fa fa-arrow-right text-primary" aria-hidden="true"/>,
                                    name: "Nhập hàng từ nhà cung cấp",
                                    click: () => history.push("/request-warehouse/request-from-supplier")
                                }, {
                                    icon: <i className="fa fa-arrow-left text-danger" aria-hidden="true"/>,
                                    name: "Trả hàng"
                                }, {
                                    icon: <i className="fa fa-exchange text-success" aria-hidden="true"/>,
                                    name: "Chuyển kho"
                                }]}
                            />
                        </div>

                        <PaginationDataTable
                            total={total}
                            columns={columns}
                            rows={requests}
                            api={({keyword, page, sortKey, isDesc}) => {
                                return warehouseApi.getRequest({
                                    keyword,
                                    skip: (page - 1) * 15,
                                    sortKey,
                                    isDesc
                                }).then(({requests, total, flowers}) => {
                                    this.setState({requests, total, flowers});
                                    return Promise.resolve();
                                })
                            }}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}