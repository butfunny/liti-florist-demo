import React, {Fragment} from "react";
import sortBy from "lodash/sortBy";
import {formatNumber, getSalary, getTotalBill} from "../../../common/common";
import moment from "moment";
import {CSVLink} from "react-csv";
import {getCSVData} from "../../order/excel";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import {DataTable} from "../../../components/data-table/data-table";
export class ReportNotSuccessBill extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {bills, customers, loading, name} = this.props;
        const getCustomer = (id) => customers.find(c => c._id == id) || {};
        const formattedBills = bills ? bills.map(b => ({...b, customer: getCustomer(b.customerId)})) : [];


        let columns = [{
            label: "Thời Gian",
            display: (bill) => moment(bill.deliverTime).format("DD/MM/YYYY HH:mm"),
            width: "20%",
            minWidth: "150",
            sortBy: (bill) => bill.bill_number
        }, {
            label: "Mã Đơn",
            display: (bill) => (
                <ColumnViewMore
                    header={bill.bill_number}
                    renderViewMoreBody={() => (
                        <Fragment>
                            {bill.items.map((item, index) => (
                                <div key={index}>
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
                                    <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> :
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
            ),
            width: "40%",
            minWidth: "300"
        }, {
            label: "Lí Do",
            width: "40%",
            minWidth: "150",
            display: (bill) => bill.reason.split(", ").map((reason, index) => (
                <div key={index}>
                    - {reason}
                </div>
            ))
        }];


        return (
            <DataTable
                loading={loading}
                columns={columns}
                rows={sortBy(formattedBills, b => -b.created)}
            />
        );

    }
}