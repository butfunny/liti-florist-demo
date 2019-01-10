import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import moment from "moment";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {premisesInfo} from "../../security/premises-info";
import {DataTable} from "../../components/data-table/data-table";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {formatNumber, getSalary, getTotalBill} from "../../common/common";
export class MemoriesRoute extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setFullYear(today.getFullYear() - 1);

        this.state = {
            selectedDate: today
        };

    }

    componentDidMount() {
        this.getBills();
    }

    getBills() {

        let {selectedDate} = this.state;

        let first = new Date(selectedDate);
        first.setHours(0, 0, 0, 0);
        let last = new Date(selectedDate);
        last.setHours(23, 59, 59, 99);

        this.setState({loading: true});
        billApi.getAllBills({
            from: first,
            to: last
        }).then(({bills, customers}) => {
            this.setState({
                bills: bills, customers, loading: false
            })
        })
    }

    render() {

        let {selectedDate, loading, bills, customers} = this.state;

        let columns = [{
            label: "Tên",
            display: (row) => row.customerName,
            sortBy: (row) => row.customerName,
            width: "33.33%",
            minWidth: "100"
        }, {
            label: "SĐT",
            display: (row) => row.customerPhone,
            sortBy: (row) => row.customerPhone,
            width: "33.33%",
            minWidth: "100"
        }, {
            label: "Mã Đơn Hàng",
            display: (row) => bills.filter(b => b.customerId == row._id).map((bill, index) => (
                <ColumnViewMore
                    key={index}
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
                        </Fragment>
                    )}
                    viewMoreText="Chi Tiết"
                    isShowViewMoreText={true}
                />
            )),
            width: "33.33%",
            minWidth: "200"
        }];

        return (
            <Layout
                activeRoute="Ngày Này Năm Xưa"
            >
                <div className="card memories-route">
                    <div className="card-title">
                        Khách hàng mua đơn ngày {moment(selectedDate).format("DD/MM/YYYY")}
                    </div>

                    <div className="card-body">
                        <DatePicker
                            className="first-margin"
                            label="Chọn Ngày"
                            value={selectedDate}
                            onChange={(selectedDate) => this.setState({selectedDate}, () => this.getBills())}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        rows={customers}
                        loading={loading}
                    />
                </div>
            </Layout>
        );
    }
}