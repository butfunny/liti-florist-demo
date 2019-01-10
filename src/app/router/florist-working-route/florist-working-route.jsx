import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import classnames from "classnames";
import {warehouseApi} from "../../api/warehouse-api";
import {premisesInfo} from "../../security/premises-info";
import {InputNumber} from "../../components/input-number/input-number";
import {FloristItem} from "./florist-item";
import {FloristCartBottom} from "./cart/florist-cart-bottom";
import {RComponent} from "../../components/r-component/r-component";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {InputQuantity} from "../../components/input-quantity/input-quantity";
import {formatNumber, getTotalBill} from "../../common/common";
import {DataTable} from "../../components/data-table/data-table";
import {productApi} from "../../api/product-api";
import sumBy from "lodash/sumBy";
import {floristApi} from "../../api/florist-api";
export class FloristWorkingRoute extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            bill: null,
            items: [],
            keyword: "",
            suppliers: []

        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))

        billApi.getBillById(props.match.params.id).then(({bill}) => {
            this.setState({bill})
        });


        premisesInfo.onChange(() => {
            this.setState({
                items: []
            })
        })

        //
        // warehouseApi.getItemsById(premisesInfo.getActivePremise()._id).then(({items, subItems}) => {
        //     this.setState({items, subItems})
        // })
    }

    handleSelectProduct(product) {
        let items = [...this.state.items];
        let itemFound = items.find(i => i._id == product._id);
        if (itemFound) {
            if (itemFound.submitQuantity + 1 <= itemFound.quantity) {
                itemFound.submitQuantity++;
            }
        }
        else items.push({parentID: product._id, submitQuantity: 1, ...product});
        this.setState({
            productID: "",
            items
        })
    }

    handleChangeQuantity(row, _quantity) {
        let items = [...this.state.items];
        let itemFound = items.find(i => i._id == row._id);
        let quantity = itemFound.quantity <= _quantity ? itemFound.quantity : _quantity;

        if (quantity === 0) {
            items = items.filter(i => i != itemFound);
        } else {
            itemFound.submitQuantity = quantity;
        }

        this.setState({
            items
        })
    }

    submit() {
        let {items, bill} = this.state;
        let {history} = this.props;
        this.setState({submitting: true});

        floristApi.submitBill({
            selectedFlower: items.map(i => {
                return {
                    parentID: i.parentID,
                    price: i.price,
                    quantity: i.submitQuantity,
                    supplierID: i.supplierID,
                    baseProductID: i.baseProductID,
                    id: i._id
                }
            }),
            billID: bill._id,
            status: bill.ships.length == 0 ? "Done" : "Chờ Giao"
        }).then(() => {
            history.push(`/florist`);
        })
    }



    render() {

        let {bill, items, suppliers, submitting} = this.state;
        let {history} = this.props;


        let columns = [{
            label: "Thông Tin SP",
            width: "90%",
            display: (row) => (
                <Fragment>
                    <div className="product-name">
                        <ImgPreview src={row.image}/> {row.name}
                    </div>

                    <div className="info-item">
                        {row.catalog}
                    </div>

                    <div className="info-item">
                        Giá: {formatNumber(row.price)}
                    </div>
                    <div className="info-item">
                        Tồn Kho: {row.quantity}
                    </div>

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
            ),
            minWidth: "150",
            sortBy: (row) => row.name
        }, {
            label: "Số Lượng",
            width: "10%",
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
        }];

        const getTotal = sumBy(items, item => item.submitQuantity * item.price);
        const getSubTotal = (bill) => sumBy(bill.items, item => item.quantity * item.price);


        const isDisabled = bill ? getTotal > (getSubTotal(bill) + (getSubTotal(bill) * 10 / 100)) : true;

        return (
            <Layout
                activeRoute="Đơn Chờ Làm"
            >

                <div className="card florist-working-route request-from-supplier">
                    <div className="card-title">
                        <i className="fa fa-chevron-left text-primary"
                           onClick={() => history.push("/florist")}
                           style={{
                               cursor: "pointer",
                               paddingRight: "5px"
                           }}
                           aria-hidden="true"/> Đơn {bill && bill.bill_number}
                    </div>

                    { bill && (
                        <div className="card-body">
                            <div>
                                {bill.items.map((item, index) => (
                                    <div key={index} style={{marginBottom: "10px"}}>
                                        <b>{item.quantity}</b> {item.flowerType} {item.name} {item.sale &&
                                    <span className="text-primary">({item.sale}%)</span>} {item.vat ?
                                        <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                                        {item.color && (
                                            <div className="text-small">Màu: {item.color.split(", ").map((c, i) => (
                                                <div key={i}
                                                     style={{
                                                         background: c,
                                                         display: "inline-block",
                                                         marginRight: "5px",
                                                         width: "15px",
                                                         height: "10px"
                                                     }}
                                                />
                                            ))}</div>)}
                                        {item.size && (<div className="text-small">Size: <b>{item.size}</b></div>)}
                                    </div>
                                ))}
                            </div>

                            <div style={{marginTop: "10px"}}>
                                {bill.vipSaleType && (
                                    <div>VIP: <b>{bill.vipSaleType}</b></div>
                                )}

                                {bill.promotion && (
                                    <span>{bill.promotion.name}: <b>{bill.promotion.discount}%</b></span>
                                )}

                                <div>Hình thức thanh toán: {bill.to.paymentType}</div>

                                <div>
                                    Ghi chú: {bill.to.notes}
                                </div>

                                <div>
                                    Nội dung thiệp: {bill.to.cardContent}
                                </div>
                            </div>

                            <div style={{marginTop: "10px", marginBottom: "24px"}}>
                                Tiền Hoa: <b>{formatNumber(getSubTotal(bill))}</b>
                            </div>

                            <AutoComplete
                                asyncGet={(name) => {
                                    if (name.length > 0) {
                                        return warehouseApi.searchProductInSubWarehouse({keyword: name, premisesID: premisesInfo.getActivePremise()._id}).then(({products, flowers}) => {
                                            return products.filter(p => items.map(i => i._id).indexOf(p._id) == -1 && p.quantity > 0).map(p => {
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
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        rows={items}
                    />

                    { bill && (
                        <div className="card-body">
                            <div className="text-right">
                                Tiền Hàng: <b className={classnames(getTotal > getSubTotal(bill) && "text-danger")}>{formatNumber(getTotal)}</b> / <b>{formatNumber(getSubTotal(bill))}</b>

                                <div>
                                    <button
                                        onClick={() => this.submit()}
                                        disabled={isDisabled || items.length == 0 || submitting}
                                        className="btn btn-primary" style={{marginTop: "10px"}}>
                                        <span className="btn-text">Done</span>
                                        {submitting && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }
}