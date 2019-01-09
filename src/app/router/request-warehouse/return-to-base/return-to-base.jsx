import React, {Fragment} from "react";
import {Layout} from "../../../components/layout/layout";
import {productApi} from "../../../api/product-api";
import {Input} from "../../../components/input/input";
import {Select} from "../../../components/select/select";
import {premisesInfo} from "../../../security/premises-info";
import {warehouseApi} from "../../../api/warehouse-api";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {DataTable} from "../../../components/data-table/data-table";
import {formatNumber} from "../../../common/common";
import sumBy from "lodash/sumBy";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../../components/img-repview/img-preview";
import {InputQuantity} from "../../../components/input-quantity/input-quantity";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
export class ReturnToBaseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            suppliers: [],
            request: {
                items: [],
                requestName: "",
                receivedName: ""
            },
            productID: ""
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    handleSelectProduct(product) {
        let items = [...this.state.request.items];
        let itemFound = items.find(i => i._id == product._id);
        if (itemFound) {
            if (itemFound.submitQuantity + 1 <= itemFound.quantity) {
                itemFound.submitQuantity++;
            }
        }
        else items.push({parentID: product._id, submitQuantity: 1, ...product});
        this.setState({
            productID: "",
            request: {
                ...this.state.request,
                items
            }
        })

    }

    handleRemoveItem(row) {
        this.setState({
            request: {
                ...this.state.request,
                items: this.state.request.items.filter(i => i.parentID != row.parentID)
            }
        })
    }

    submit() {

        let {request} = this.state;

        const mapItem = (item) => ({
            parentID: item.parentID,
            oriPrice: item.oriPrice,
            price: item.price,
            quantity: item.submitQuantity,
            supplierID: item.supplierID,
            id: item._id
        });

        warehouseApi.createRequest({
            ...request,
            items: request.items.map(item => mapItem(item)),
            requestType: "return-to-base",
            created: new Date(),
            status: "pending"
        }).then(() => {
            confirmModal.alert("Gửi phiếu thành công");
            this.setState({
                request: {
                    items: [],
                    requestName: "",
                    receivedName: ""
                }
            })
        })
    }

    handleChangeQuantity(row, _quantity) {
        let items = [...this.state.request.items];
        let itemFound = items.find(i => i._id == row._id);
        let quantity = itemFound.quantity <= _quantity ? itemFound.quantity : _quantity;

        if (quantity === 0) {
            items = items.filter(i => i != itemFound);
        } else {
            itemFound.submitQuantity = quantity;
        }

        this.setState({
            request: {
                ...this.state.request,
                items
            }
        })
    }

    render() {
        let {history} = this.props;
        let {request, saving, suppliers} = this.state;
        const premises = premisesInfo.getPremises();

        let columns = [{
            label: "Thông Tin SP",
            width: "35%",
            display: (row) => (
                <ColumnViewMore
                    header={
                        <div className="product-name">
                            <ImgPreview src={row.image}/> {row.name}
                        </div>
                    }
                    renderViewMoreBody={() => (
                        <Fragment>
                            <div className="info-item">
                                Nhà cung cấp: {suppliers.find(s => s._id == row.supplierID).name}
                            </div>

                            <div className="info-item">
                                Màu:
                                {row.colors.map((color, index) => (
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
                                Đơn Vị Tính: {row.unit}
                            </div>

                            { row.lengthiness && (
                                <div className="info-item">
                                    Chiều Dài Cành Hoa: {row.lengthiness}
                                </div>
                            )}
                        </Fragment>
                    )}
                    viewMoreText="Chi Tiết"
                    subText={<div>{row.productID} - {suppliers.find(s => s._id == row.supplierID).name}</div>}
                    isShowViewMoreText
                />
            ),
            minWidth: "200",
            sortBy: (row) => row.name
        }, {
            label: "Tồn Kho",
            width: "10%",
            display: (row) => row.quantity,
            className: "number content-menu-action",
            minWidth: "50",
            sortBy: (row) => row.quantity
        }, {
            label: "Số Lượng",
            width: "15%",
            display: (row) => (
                <InputQuantity
                    value={row.submitQuantity}
                    onChange={(quantity) => {
                        this.handleChangeQuantity(row, quantity)
                    }}
                />
            ),
            className: "number content-menu-action",
            minWidth: "150",
            sortBy: (row) => row.quantity
        }, {
            label: "Giá Nhập",
            width: "10%",
            display: (row) => formatNumber(row.oriPrice),
            className: "number content-menu-action",
            minWidth: "100",
            sortBy: (row) => row.oriPrice
        }, {
            label: "Giá Bán",
            width: "10%",
            display: (row) => formatNumber(row.price),
            className: "number content-menu-action",
            minWidth: "100",
            sortBy: (row) => row.price
        }, {
            label: "Thành Tiền",
            width: "15%",
            display: (row) => formatNumber(row.quantity * row.price),
            className: "number content-menu-action",
            minWidth: "100",
            sortBy: (row) => row.quantity * row.price
        }, {
            label: "",
            width: "5%",
            display: (row) => <button onClick={() => this.handleRemoveItem(row)} className="btn btn-small btn-danger"><i className="fa fa-trash" aria-hidden="true"/></button>,
            className: "number content-menu-action",
            minWidth: "50",
        }];

        return (
            <Layout
                activeRoute="Phiếu Xuất Nhập Kho"
            >
                <div className="request-from-supplier">
                    <div className="card">
                        <div className="card-title">
                            <i className="fa fa-chevron-left text-primary"
                               onClick={() => history.push("/request-warehouse")}
                               style={{
                                   cursor: "pointer",
                                   paddingRight: "5px"
                               }}
                               aria-hidden="true"/> Phiếu trả kho
                        </div>

                        <div className="card-body">

                            <Select
                                label="Chọn kho*"
                                list={premises.map(s => s._id)}
                                value={request.premisesID}
                                displayAs={(r) => premises.find(s => s._id == r) ? premises.find(s => s._id == r).name : null}
                                onChange={(premisesID) => this.setState({request: {...request, premisesID, items: []}})}
                            />

                            <div className="row">
                                <Input
                                    className="col"
                                    label="Người Gửi*"
                                    value={request.requestName}
                                    onChange={(e) => this.setState({request: {...request, requestName: e.target.value}})}
                                />

                                <Input
                                    className="col"
                                    label="Người Nhận*"
                                    value={request.receivedName}
                                    onChange={(e) => this.setState({request: {...request, receivedName: e.target.value}})}
                                />
                            </div>

                            { request.premisesID && (
                                <AutoComplete
                                    asyncGet={(name) => {
                                        if (name.length > 0) {
                                            return warehouseApi.searchProductInSubWarehouse({keyword: name, premisesID: request.premisesID}).then(({products, flowers}) => {
                                                return products.filter(p => request.items.map(i => i._id).indexOf(p._id) == -1 && p.quantity > 0).map(p => {
                                                    let flower = flowers.find(f => f._id == p.parentID);
                                                    return {
                                                        ...flower,
                                                        ...p
                                                    }
                                                })
                                            })
                                        }
                                        return Promise.resolve([])
                                    }}
                                    onSelect={(product) => this.handleSelectProduct(product)}
                                    objectKey="productID"
                                    object={this.state}
                                    onChange={(value) => this.setState({productID: value})}
                                    displayAs={(product) => <span><b>{product.name}</b> - {product.catalog} - {suppliers.find(s => s._id == product.supplierID).name}</span>}
                                    noPopup
                                    label="Tên/Mã Sản Phẩm"
                                />
                            )}
                        </div>

                        { request.premisesID && (
                            <Fragment>
                                <DataTable
                                    columns={columns}
                                    rows={request.items}
                                />

                                <div className="card-body">
                                    <div className="text-right">
                                        Tổng Tiền: <b>{formatNumber(sumBy(request.items, item => item.quantity * item.price))}</b>

                                        <div style={{marginTop: "12px"}}>
                                            <button className="btn btn-primary"
                                                    onClick={() => this.submit()}
                                                    disabled={!request.premisesID || request.items.filter(i => i.submitQuantity > 0).length == 0 || request.requestName.length == 0 || request.receivedName.length == 0}
                                            >
                                                Tạo Phiếu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>
            </Layout>
        );
    }
}