import React, {Fragment} from "react";
import sumBy from "lodash/sumBy";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import moment from "./report-bill-payment-type";
import {formatNumber, getTotalBill} from "../../../common/common";
import {DataTable} from "../../../components/data-table/data-table";
import sortBy from "lodash/sortBy";
export class ReportBillType extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {types, bills, loading} = this.props;

        let itemsColor = types.map(t => ({
            name: t,
            total: sumBy(bills, (bill) => {
                for (let item of bill.items) {
                    if (item.flowerType && item.flowerType == t) return 1
                }
                return 0;
            }),
            bills: bills.filter((bill) => {
                for (let item of bill.items) {
                    if (item.flowerType && item.flowerType == t) return 1
                }
                return 0;
            })
        }));

        let columns = [{
            label: "Tên",
            display: (row) => row.name,
            width: "30%",
            minWidth: "150",
            sortBy: (row) => row.name
        }, {
            label: "Số Lượng",
            display: (row) => row.total,
            width: "20%",
            minWidth: "50",
            sortBy: (row) => row.total
        }, {
            label: "Mã Đơn",
            display: (row) => row.bills.length > 0 && (
                <ColumnViewMore
                    viewMoreText={`Xem toàn bộ ${row.bills.length} đơn`}
                    isShowViewMoreText={true}
                    renderViewMoreBody={() =>
                        row.bills.map((bill, index) => (
                            <ColumnViewMore
                                key={index}
                                header={bill.bill_number}
                                renderViewMoreBody={() => (
                                    <Fragment>
                                        <div>
                                            Thời gian: {moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}
                                        </div>

                                        {bill.items.map((item, index) => (
                                            <div key={index}>
                                                <b>{item.quantity}</b> {item.flowerType} {item.name} {item.sale &&
                                            <span className="text-primary">({item.sale}%)</span>} {item.vat ?
                                                <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                                                {item.color && (
                                                    <div
                                                        className="text-small">Màu: {item.color.split(", ").map((c, i) => (
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
                                                {item.size && (
                                                    <div className="text-small">Size: <b>{item.size}</b></div>)}
                                            </div>
                                        ))}

                                        {bill.vipSaleType && (
                                            <div>VIP: <b>{bill.vipSaleType}</b></div>
                                        )}

                                        {bill.promotion && (
                                            <span>{bill.promotion.name}: <b>{bill.promotion.discount}%</b></span>
                                        )}

                                        <div style={{
                                            marginTop: "10px"
                                        }}>
                                            {bill.to.paymentType == "Nợ" ?
                                                <span
                                                    className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> :
                                                <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                                        </div>

                                        <div>Hình thức thanh toán: {bill.to.paymentType}</div>

                                        <div>
                                            Ghi chú: {bill.to.notes}
                                        </div>

                                        <div>
                                            Nội dung thiệp: {bill.to.cardContent}
                                        </div>

                                        <div style={{
                                            marginTop: "10px"
                                        }}>
                                            <div>Sale: <b>{bill.sales.length > 0 ? bill.sales.map(s => s.username).join(", ") : (bill.to || {}).saleEmp}</b>
                                            </div>
                                            <div>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : (bill.to || {}).florist}</b>
                                            </div>
                                            <div>Ship: <b>{bill.ships.length > 0 && bill.ships.map(s => s.username).join(", ")}</b>
                                            </div>
                                        </div>
                                    </Fragment>
                                )}
                                viewMoreText="Chi Tiết"
                                isShowViewMoreText={true}
                            />
                        ))
                    }

                />
            ),
            width: "50%",
            minWidth: "300"
        }];



        return (
            <DataTable
                loading={loading}
                columns={columns}
                rows={sortBy(itemsColor, c => -c.total)}
            />
        );
    }
}