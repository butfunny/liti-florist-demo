import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {floristApi} from "../../api/florist-api";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import classnames from "classnames";
import {userInfo} from "../../security/user-info";
import {shipApi} from "../../api/ship-api";
import {billApi} from "../../api/bill-api";
import {DataTable} from "../../components/data-table/data-table";

export class ShipRoute extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            bills: [],
            from: today,
            to: endDay,
            loading: false
        };

        this.getBills();
    }

    getBills() {
        let {from, to} = this.state;
        shipApi.getBills({from, to}).then((bills) => {
            this.setState({
                bills: bills.map(bill => {
                    return {
                        ...bill,
                        lastTime: new Date(bill.deliverTime).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.deliverTime).getTime() - new Date().getTime()) : new Date(bill.deliverTime).getTime() - new Date().getTime()
                    }
                })
            })
        })
    }

    submit(bill) {
        let {bills} = this.state;
        this.setState({
            bills: bills.map(b => {
                if (b._id == bill._id) {
                    return {...b, status: "Done"}
                }
                return b
            })
        });


        shipApi.submitBill({
            billID: bill._id
        })
    }

    render() {

        let {from, to, loading, bills} = this.state;
        let {history} = this.props;

        const user = userInfo.getUser();

        let columns = [{
            label: "Mã Đơn",
            display: (bill) => (
                <div>
                    <div>{moment(bill.deliverTime).format("DD/MM/YYYY HH:mm")}</div>
                    <div style={{marginTop: "5px"}}>{bill.bill_number}</div>
                    <div>Ship: <b>{bill.ships &&
                    <b>{bill.ships.map(f => f.username).join(", ")}</b>}</b></div>
                    <div>Phí Ship: <b>{typeof bill.to.shipMoney == "string" ? 0 : formatNumber(bill.to.shipMoney)}</b></div>
                </div>
            ),
            width: "20%",
            minWidth: "150",
            sortBy: (bill) => bill.bill_number
        }, {
            label: "Thông tin đơn",
            display: (bill) => (
                <div>
                    {bill.items.map((item, index) => (
                        <div key={index}>
                            <b>{item.quantity}</b> {item.name} {item.sale &&
                        <span className="text-primary">({item.sale}%)</span>}
                        </div>
                    ))}

                    <div style={{
                        marginTop: "10px"
                    }}>
                        {bill.payment_type == "Nợ" ? <span
                                className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> :
                            <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                    </div>


                    <div>
                        Ghi chú: {bill.to.notes}
                    </div>

                    <div>
                        Nội dung thiệp: {bill.to.cardContent}
                    </div>


                    <div style={{marginTop: "10px"}}>Địa chỉ nhận: <b>{bill.to.receiverPlace}</b></div>
                    <div>Người Nhận: <b>{bill.to.receiverName}</b></div>
                    <div>SĐT: <b>{bill.to.receiverPhone}</b></div>
                </div>
            ),
            width: "50%",
            minWidth: "300"
        }, {
            label: "Trạng Thái",
            width: "20%",
            minWidth: "100",
            display: (bill) => bill.status
        }, {
            label: "",
            width: "10%",
            minWidth: "100",
            display: (bill) => bill.status == "Chờ Giao" && (
                <button className="btn btn-primary btn-small"
                        onClick={() => this.submit(bill)}
                >
                    Done
                </button>
            )

        }];

        return (
            <Layout
                activeRoute="Đơn Chờ Ship">
                <div className="florist-route bill-report-route">


                    <div className="card">
                        <div className="card-title">
                            Lọc
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
                        </div>

                        <DataTable
                            columns={columns}
                            rows={bills && sortBy(bills, "lastTime")}
                            loading={loading}
                            rowStyling={(bill) => {
                                if (new Date(bill.deliverTime).getTime() < new Date().getTime() + 1800000 && bill.status == "Chờ xử lý") return {background: "rgba(253,57,122, .1)"};
                                if (bill.status == "Khiếu Nại" || bill.status == "Huỷ Đơn") return {background: "rgba(255,184,34, .1)"};
                                if (bill.status == "Done") return {background: "rgb(29,201,183, .1)"}
                            }}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}