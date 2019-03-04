import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {billApi} from "../../api/bill-api";
import {floristApi} from "../../api/florist-api";
import {filteredByKeys, formatNumber, getSalary, getTotalBill} from "../../common/common";
import {DatePicker} from "../../components/date-picker/date-picker";
import {Input} from "../../components/input/input";
import moment from "moment";
import sortBy from "lodash/sortBy";
import {userInfo} from "../../security/user-info";
import sumBy from "lodash/sumBy"
import {paymentTypes} from "../../common/constance";
import {DataTable} from "../../components/data-table/data-table";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";

export class MySalaryRoute extends React.Component {

    constructor(props) {
        super(props);
        let today = new Date();
        today.setDate(1);
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            from: today,
            to: endDay,
            bills: null,
            keyword: "",
            selectedType: "Tất cả"
        };

    }

    componentDidMount() {
        this.getBills();
    }

    getBills() {
        this.setState({loading: true});
        floristApi.getMySalary({from: this.state.from, to: this.state.to}).then((bills) => {
            this.setState({bills: bills, loading: false})
        })
    }


    render() {

        let {bills, selectedType, keyword, from, to, loading} = this.state;
        let billsFiltered = bills ? bills.filter(b => b.bill_number.toLowerCase().indexOf(keyword.toLowerCase()) > -1) : bills;
        const user = userInfo.getUser();

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
                        </Fragment>
                    )}
                    viewMoreText="Chi Tiết"
                    subText={getSalary(user, bill).isOnl && <span className="text-primary">(Đơn onl)</span>}
                    isShowViewMoreText={true}
                />
            ),
            width: "55%",
            minWidth: "300"
        }, {
            label: "Thu",
            width: "25%",
            minWidth: "150",
            display: (bill) => (
                <span>
                    {formatNumber(getSalary(user, bill).money)} {getSalary(user, bill).percent && <span className="text-primary">({getSalary(user, bill).percent}%)</span>}
                </span>
            )
        }];




        return (
            <Layout
                activeRoute="Doanh Thu Của Tôi"
            >
                <div className="my-salary-route bill-report-route">


                    <div className="card">
                        <div className="card-title">
                            Doanh Thu

                            <span className="text-small text-primary">Tổng thu {formatNumber(sumBy(bills, b => getSalary(user, b).money))}</span>
                        </div>

                        <div className="card-body">

                            <div className="row first-margin"
                            >
                                <DatePicker
                                    className="col"
                                    label="Từ Ngày"
                                    value={from}
                                    onChange={(from) => {
                                        this.setState({from})
                                    }}
                                />

                                <DatePicker
                                    className="col"
                                    label="Tới Ngày"
                                    value={to}
                                    onChange={(to) => {
                                        this.setState({to})
                                    }}
                                />

                                <button className="btn btn-primary"
                                        onClick={() => this.getBills()}
                                        disabled={loading}
                                >
                                    <span className="btn-text">Lọc</span>
                                    { loading &&
                                    <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>
                                    }
                                </button>
                            </div>

                            <Input
                                className="first-margin"
                                value={keyword}
                                onChange={(e) => this.setState({keyword: e.target.value})}
                                label="Tìm mã đơn"
                            />
                        </div>

                        <DataTable
                            columns={columns}
                            rows={billsFiltered}
                            loading={loading}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}