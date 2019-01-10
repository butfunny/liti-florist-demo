import React from "react";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {floristApi} from "../../api/florist-api";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import classnames from "classnames";
import {userInfo} from "../../security/user-info";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {ButtonGroup} from "../../components/button-group/button-group";
import {security} from "../../security/secuiry-fe";
import {DataTable} from "../../components/data-table/data-table";
import {RComponent} from "../../components/r-component/r-component";
export class FloristRoute extends RComponent {

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


        this.onMount(() => {
            this.getBills();
        })
    }

    getBills() {
        let {from, to} = this.state;
        this.setState({loading: true});
        floristApi.getBills({from, to}).then((bills) => {
            this.setState({
                bills: bills.map(bill => {
                    return {
                        ...bill,
                        lastTime: new Date(bill.deliverTime).getTime() - new Date().getTime() < 0 ? 999999999 + Math.abs(new Date(bill.deliverTime).getTime() - new Date().getTime()) : new Date(bill.deliverTime).getTime() - new Date().getTime()
                    }
                }),
                loading: false
            })
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
                    <div style={{marginTop: "5px"}}>Florist: <b>{bill.florists.length > 0 ? bill.florists.map(s => s.username).join(", ") : (bill.to || {}).florist}</b></div>
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
            display: (bill) => bill.florists && bill.florists[0].user_id == user._id && bill.status == "Chờ xử lý" && (
                <button className="btn btn-primary btn-small"
                    onClick={() => history.push(`/florist-working/${bill._id}`)}
                >
                    Làm Đơn
                </button>
            )

        }];

        return (
            <Layout
                activeRoute="Đơn Chờ Làm">
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
                                    value={from}
                                    onChange={(from) => {
                                        this.setState({from})
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
                                if (bill.status == "Done" || bill.status.toLowerCase() == "Chờ Giao".toLowerCase()) return {background: "rgb(29,201,183, .1)"}
                            }}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}