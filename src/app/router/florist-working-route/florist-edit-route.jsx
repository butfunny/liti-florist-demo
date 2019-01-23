import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {productApi} from "../../api/product-api";
import {billApi} from "../../api/bill-api";
import {premisesInfo} from "../../security/premises-info";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {formatNumber} from "../../common/common";
import {InputQuantity} from "../../components/input-quantity/input-quantity";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {warehouseApi} from "../../api/warehouse-api";
import moment from "moment";
import {DataTable} from "../../components/data-table/data-table";
import classnames from "classnames";
import sumBy from "lodash/sumBy";
import {AutoCompleteNormal} from "../../components/auto-complete/auto-complete-normal";
import uniq from "lodash/uniq";
import {floristApi} from "../../api/florist-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
export class FloristEditRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bill: null,
            items: [],
            keyword: "",
            suppliers: []
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}));

        billApi.getBillById(props.match.params.id).then(({bill}) => {
            warehouseApi.searchProductInSubWarehouse({keyword: "", premisesID: premisesInfo.getActivePremise()._id}).then(({products, flowers}) => {
                const updateProductQuantity = () => {
                    return products.map((p) => {
                        let found = bill.selectedFlower.find(item => item.id == p._id);
                        let flower = flowers.find(f => f._id == p.parentID);

                        if (found) {
                            return {...flower, ...p, quantity: found.quantity + p.quantity}
                        }
                        return {...flower, ...p};
                    })
                };

                this.setState({
                    products: updateProductQuantity(),
                    flowers,
                    bill
                })
            });

        });


        premisesInfo.onChange(() => {
            props.history.push("/florist")
        })
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

        floristApi.editBill({
            selectedFlower: items.map(i => {
                return {
                    parentID: i.parentID,
                    price: i.price,
                    quantity: i.submitQuantity,
                    supplierID: i.supplierID,
                    baseProductID: i.baseProductID,
                    id: i._id,
                    oriPrice: i.oriPrice
                }
            }),
            billID: bill._id
        }).then(() => {
            confirmModal.alert("Cập nhật thành công");
            history.push(`/florist`);
        })
    }





    render() {

        let {bill, items, suppliers, submitting, products, flowers} = this.state;
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
            minWidth: "175",
            sortBy: (row) => row.quantity
        }];




        const getTotal = sumBy(items, item => item.submitQuantity * item.price);
        const getSubTotal = (bill) => sumBy(bill.items, item => item.quantity * item.price);

        const isDisabled = bill ? getTotal > (getSubTotal(bill) + (getSubTotal(bill) * 10 / 100)) : true;


        let lastColumns = [{
            label: "Thông Tin Hoa",
            width: "90%",
            display: (row) => {

                let product = flowers.find(p => p._id == row.parentID);

                return (
                    <div className="product-name">
                        <ImgPreview src={product.image}/> {product.name}
                    </div>
                )
            },
            minWidth: "150",
        }, {
            label: "Số Lượng",
            width: "10%",
            display: (row) => row.quantity,
            minWidth: "175",
            sortBy: (row) => row.quantity
        }];



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


                            <b>Định lượng hiện tại</b>
                        </div>
                    )}

                    { bill && products && (
                        <DataTable
                            columns={lastColumns}
                            rows={bill.selectedFlower}
                        />
                    )}

                    <div className="card-body">

                        <div style={{marginTop: "10px", marginBottom: "24px"}}>
                            <b>Định lượng mới</b>
                        </div>

                        <AutoComplete
                            asyncGet={(name) => {
                                if (name.length > 0) {
                                    return Promise.resolve(products.filter(product => {
                                        return product.quantity > 0 && (product.productID.toLowerCase().indexOf(name.toLowerCase()) > -1 || product.name.toLowerCase().indexOf(name.toLowerCase()) > -1)                                    }))
                                }
                                return Promise.resolve([])
                            }}
                            onSelect={(product) => this.handleSelectProduct(product)}
                            objectKey="productID"
                            object={this.state}
                            onChange={(value) => this.setState({productID: value})}
                            displayAs={(product) => <span>{moment(product.created).format("DD/MM/YYYY")} <b>{product.name}</b> - {product.catalog} - {suppliers.find(s => s._id == product.supplierID).name}</span>}
                            noPopup
                            label="Tên/Mã Sản Phẩm"
                        />
                    </div>


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
                                        <span className="btn-text">Cập Nhật</span>
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