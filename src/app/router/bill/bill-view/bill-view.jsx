import React, {Fragment} from "react";
import {formatNumber, getTotalBill} from "../../../common/common";
import {InputNumber} from "../../../components/input-number/input-number";
import {InputQuantity} from "../../../components/input-quantity/input-quantity";
import {DataTable} from "../../../components/data-table/data-table";
import {Select} from "../../../components/select/select";
import sumBy from "lodash/sumBy";

export class BillView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bill, onChangeItems, editMode, activePromotions = [], onChangeBill} = this.props;
        const items = bill.items;



        let columns = [{
            label: "Tên",
            width: "30%",
            display: (item) => <div className="dt-col">{item.flowerType} {item.name}</div>,
            minWidth: "150"
        }, {
            label: "SL",
            width: "30%",
            display: (item) => (
                <InputQuantity
                    value={item.quantity}
                    onChange={(value) => {
                        if (value == 0) onChangeItems(items.filter(i => i.name != item.name));
                        else {
                            onChangeItems(items.map(i => {
                                if (i.name == item.name) return {...i, quantity: value};
                                return i;
                            }))
                        }
                    }}
                />
            ),
            minWidth: "150"
        }, {
            label: "Đơn Giá",
            width: "15%",
            display: (item) => <div className="dt-col">{formatNumber(item.price)}</div>,
            minWidth: "100"
        }, {
            label: "KM",
            width: "15%",
            display: (item) => (
                <InputNumber
                    maxVal={100}
                    autoSelect
                    value={item.sale || ""}
                    onChange={(sale) => {
                        if (sale <= 100) {
                            onChangeItems(items.map(i => {
                                if (i.name == item.name) return {...i, sale};
                                return i;
                            }))
                        }
                    }}
                />
            ),
            minWidth: "75"
        }, {
            label: "VAT",
            width: "15%",
            display: (item) => (
                <InputNumber
                    maxVal={100}
                    autoSelect
                    value={item.vat || ""}
                    onChange={(vat) => {
                        if (vat <= 100) {
                            onChangeItems(items.map(i => {
                                if (i.name == item.name) return {...i, vat};
                                return i;
                            }))
                        }
                    }}
                />
            ),
            minWidth: "75"
        }, {
            label: "",
            width: "5%",
            display: (item) => (
                <button className="btn btn-small btn-danger remove-btn"
                        onClick={() => {onChangeItems(items.filter(i => i.name != item.name))}}>
                    <i className="fa fa-trash"/>
                </button>
            ),
            minWidth: "50"
        }];



        const getPriceBill = (bill) => sumBy(bill.items, item => item.price * item.quantity);


        return (
            <div className="card bill-view">
                <div className="card-title">
                    Thông Tin Đơn
                </div>

                <DataTable
                    rows={items}
                    columns={columns}
                />


                {items.length > 0 && (
                    <div className="card-body">

                        <div className="text-right">
                            Thành Tiền: <b>{formatNumber(getPriceBill(bill))}</b>
                        </div>

                        {activePromotions.length > 0 && bill.promotion && (
                            <Select
                                label="Khuyến Mại"
                                value={bill.promotion.promotion_id}
                                onChange={(value) => {
                                    const found = activePromotions.find(p => p._id == value);
                                    onChangeBill({
                                        ...bill, promotion: {
                                            promotion_id: found._id,
                                            name: found.name,
                                            discount: found.discount,
                                        }
                                    })
                                }}
                                list={activePromotions.map(a => a._id)}
                                displayAs={(value) => {
                                    const promotion = activePromotions.find(p => p._id == value);
                                    if (promotion) return <span>{promotion.name} - {promotion.discount}%</span>
                                }}
                            />
                        )}

                        { bill.vipSaleType && (
                            <div className="text-right">
                                VIP: <b>{bill.vipSaleType}</b>
                            </div>
                        )}

                        { editMode && bill.promotion && (
                            <div className="text-right">
                                {bill.promotion.name}: {bill.promotion.discount}%
                            </div>
                        )}

                        {bill.payOwe && bill.customerInfo && (
                            <div className="text-right">
                                Thanh toán nợ: <b>{formatNumber(bill.customerInfo.spend.totalOwe)}</b>
                            </div>
                        )}


                        <div className="text-right">
                            Tổng Tiền: <b>{formatNumber(getTotalBill(bill))}</b>
                        </div>
                    </div>
                )}


            </div>
        );
    }
}