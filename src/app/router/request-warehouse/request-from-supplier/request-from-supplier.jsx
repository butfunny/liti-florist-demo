import React, {Fragment} from "react";
import {Layout} from "../../../components/layout/layout";
import {productApi} from "../../../api/product-api";
import {Select} from "../../../components/select/select";
import {Input} from "../../../components/input/input";
import {customerApi} from "../../../api/customer-api";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {flowersApi} from "../../../api/flowers-api";
import {ButtonGroup} from "../../../components/button-group/button-group";
import {formatNumber} from "../../../common/common";
import {DataTable} from "../../../components/data-table/data-table";
import omit from "lodash/omit";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import {InputQuantity} from "../../../components/input-quantity/input-quantity";
import sumBy from "lodash/sumBy";
import pick from "lodash/pick";
import {warehouseApi} from "../../../api/warehouse-api";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {InputNumber} from "../../../components/input-number/input-number";
import {ImgPreview} from "../../../components/img-repview/img-preview";
import {security} from "../../../security/secuiry-fe";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {TimePicker} from "../../../components/time-picker/time-picker";
export class RequestFromSupplier extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            suppliers: [],
            request: {
                items: [],
                requestName: "",
                receivedName: "",
                created: new Date(),
                expireDate: new Date()
            },
            productID: ""
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    handleSelectProduct(product) {
        let items = [...this.state.request.items];
        let itemFound = items.find(i => i.parentID == product._id);
        if (itemFound) itemFound.quantity++;
        else items.push({parentID: product._id, quantity: 1, ...product});
        this.setState({
            productID: "",
            request: {
                ...this.state.request,
                items
            }
        })
    }

    handleChangeQuantity(row, quantity) {
        let items = [...this.state.request.items];
        let itemFound = items.find(i => i.parentID == row.parentID);

        if (quantity === 0) {
            items = items.filter(i => i != itemFound);
        } else {
            itemFound.quantity = quantity;
        }

        this.setState({
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

    handleChangeItem(row, key, value) {
        let items = [...this.state.request.items];
        let itemFound = items.find(i => i.parentID == row.parentID);
        itemFound[key] = value;
        this.setState({
            request: {
                ...this.state.request,
                items
            }
        })
    }

    submit() {

        let {request} = this.state;

        warehouseApi.createRequest({
            ...request,
            items: request.items.map(item => ({supplierID: request.supplierID, created: request.created, ...pick(item, ["parentID", "oriPrice", "price", "quantity"])})),
            requestType: "request-from-supplier",
            created: request.created,
            status: "pending"
        }).then(() => {
            confirmModal.alert("Gửi phiếu thành công");
            this.setState({
                request: {
                    items: [],
                    requestName: "",
                    receivedName: "",
                    created: request.created,
                    expireDate: new Date()
                }
            })
        })
    }

    render() {

        let {suppliers, request, saving} = this.state;

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
                    subText={<div>{row.productID} - {row.catalog}</div>}
                    isShowViewMoreText
                />
            ),
            minWidth: "200",
            sortBy: (row) => row.name
        }, {
            label: "Số Lượng",
            width: "15%",
            display: (row) => (
                <InputQuantity
                    value={row.quantity}
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
            width: "15%",
            display: (row) => (
                <InputNumber
                    value={row.oriPrice}
                    onChange={(oriPrice) => this.handleChangeItem(row, "oriPrice", oriPrice)}
                />
            ),
            className: "number content-menu-action",
            minWidth: "100",
            sortBy: (row) => row.oriPrice
        }, {
            label: "Giá Bán",
            width: "15%",
            display: (row) => (
                <InputNumber
                    value={row.price}
                    onChange={(price) => this.handleChangeItem(row, "price", price)}
                />
            ),
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

        let {history} = this.props;


        return (
            <Layout
                activeRoute="Phiếu Xuất Nhập Kho"
                hidden={!security.isHavePermission(["warehouse.request.create-request-from-supplier"])}
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
                               aria-hidden="true"/> Phiếu nhập hàng
                        </div>

                        <div className="card-body">

                            <Select
                                label="Nhà Cung Cấp*"
                                list={suppliers.map(s => s._id)}
                                value={request.supplierID}
                                displayAs={(r) => suppliers.find(s => s._id == r)? suppliers.find(s => s._id == r).name : null}
                                onChange={(supplierID) => this.setState({request: {...request, supplierID}})}
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

                            <div className="row">
                                <DatePicker
                                    className="col"
                                    label="Ngày nhập"
                                    value={request.created}
                                    onChange={(deliverTime) => this.setState({request: {...request, created: deliverTime}})}
                                />

                                <TimePicker
                                    className="col"
                                    value={request.created}
                                    onChange={(deliverTime) => this.setState({request: {...request, created: deliverTime}})}
                                />
                            </div>

                            <DatePicker
                                className="col"
                                label="Hạn Sử Dụng"
                                value={request.expireDate}
                                onChange={(deliverTime) => this.setState({request: {...request, expireDate: deliverTime}})}
                            />


                            <AutoComplete
                                asyncGet={(name) => {
                                    if (name.length > 0) {
                                        return flowersApi.getFlowers({keyword: name, skip: 0}).then((resp) => resp.flowers)
                                    }
                                    return Promise.resolve([])
                                }}
                                onSelect={(product) => this.handleSelectProduct(product)}
                                objectKey="productID"
                                object={this.state}
                                onChange={(value) => this.setState({productID: value})}
                                displayAs={(product) => <span>{product.productID} - <b>{product.name}</b> - {product.catalog}</span>}
                                noPopup
                                label="Tên/Mã Sản Phẩm"
                            />
                        </div>

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
                                        disabled={request.items.filter(i => i.quantity > 0).length == 0 || !request.supplierID || request.requestName.length == 0 || request.receivedName.length == 0}
                                    >
                                        Tạo Phiếu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}