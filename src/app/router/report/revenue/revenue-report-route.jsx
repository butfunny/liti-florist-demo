import React, {Fragment} from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import {
    formatNumber,
    getBillProfit,
    getStartAndLastDayOfWeek,
    getTotalBill,
    getTotalBillWithoutVAT
} from "../../../common/common";
import sumBy from "lodash/sumBy";
import {RevenueReportCustomer} from "./revenue-report-customer";
import {RevenueReportBill} from "./revenue-report-bill";
import {userInfo} from "../../../security/user-info";
import {permissionInfo} from "../../../security/premises-info";
import {paymentTypes} from "../../../common/constance";
import {RevenueReportSupplier} from "./revenue-report-supplier";
import {Select} from "../../../components/select/select";


export class RevenueReportRoute extends React.Component {

    constructor(props) {
        super(props);
        let {from, to} = getStartAndLastDayOfWeek();

        this.state = {
            from,
            to,
            loading: true,
            bills: [],
            customers: [],
            vips: [],
            viewType: "Khách Hàng",
            lastInitBills: [],
            filterType: "Trong Tuần",
            initBills: {}
        };

        this.getInitReport();

    }


    getInitReport() {
        let {from, to} = this.state;
        let today = new Date();
        today.setDate(today.getDate() - 7);
        let lastWeek = getStartAndLastDayOfWeek(today);
        Promise.all([billApi.getReportAll({from, to}), billApi.getReportAll({from: lastWeek.from, to: lastWeek.to})]).then((resp) => {
            let {bills, customers, vips} = resp[0];
            this.setState({bills, customers, vips, loading: false, lastInitBills: resp[1].bills, initBills: resp[0]})
        })


    }

    getReport() {
        this.setState({loading: true, bills: [], customers: [], vips: []});
        let {from, to} = this.state;
        billApi.getReportAll({from, to}).then(({bills, customers, vips}) => {
            this.setState({bills, customers, vips, loading: false})
        })
    }



    render() {
        let {loading, from, to, viewType, filterType, initBills, lastInitBills} = this.state;

        let {customers, items, bills} = filterType == "Trong Tuần" ? initBills : this.state;




        return (
            <Layout activeRoute="Doanh Thu">

                <div className="card bill-report-route">
                    <div className="card-title">
                        Báo cáo doanh thu

                        <span className="text-small text-primary">{bills ? bills.length : 0} Đơn</span>


                        <div className="text-info margin-top">
                            Tổng Thu: <b className="text-primary">{formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBill(b)))}</b>
                        </div>

                        <div className="text-info">
                            Khách Mới: <b className="text-primary">{bills ? bills.filter(b => b.isNewCustomer).length : 0}</b>
                        </div>

                        <div className="text-info">
                            Tổng Thu chưa bao gồm VAT: <b className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBillWithoutVAT(b))) : 0}</b>
                        </div>

                        <div className="text-info">
                            Tổng Đơn Free: <b className="text-primary">{bills ? bills.filter(b => getTotalBill(b) == 0 || b.to.paymentType == "Free").length : 0}</b>

                        </div>

                        <div className="text-info">
                            Lợi Nhuận: <b className="text-primary">{formatNumber(sumBy(bills, b => b.status == "Done" ? getBillProfit(b) : 0))}</b>
                        </div>
                    </div>

                    <div className="card-body">
                        <Select
                            className="first-margin"
                            label="Lọc Theo"
                            value={filterType}
                            list={["Trong Tuần", "Chọn Ngày"]}
                            onChange={(filterType) => this.setState({filterType})}
                        />

                        { filterType == "Chọn Ngày" && (
                            <div className="row"
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
                                        onClick={() => this.getReport()}
                                        disabled={loading}
                                >
                                    <span className="btn-text">Xem</span>
                                    {loading &&
                                    <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">

                    </div>
                </div>

                <div className="report-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo cáo doanh thu</h1>
                    </div>

                    <div className="form-group">
                        <select
                            className="form-control"
                            value={filterType} onChange={(e) => this.setState({filterType: e.target.value})}>
                            <option  value="Trong Tuần">Trong Tuần</option>
                            <option  value="Chọn Ngày">Chọn Ngày</option>
                        </select>
                    </div>


                    { !loading && (
                        <Fragment>
                            <div className="form-group">

                            </div>

                            <div className="form-group">
                                <label>Báo cáo theo</label>
                                <select className="form-control"
                                        value={viewType}
                                        onChange={(e) => this.setState({viewType: e.target.value})}
                                >
                                    <option value="Khách Hàng">Khách Hàng</option>
                                    <option value="Cửa Hàng">Cửa Hàng</option>
                                    <option value="Nhà Cung Cấp">Nhà Cung Cấp</option>
                                </select>
                            </div>

                            { viewType == "Cửa Hàng" ? (
                                <RevenueReportBill
                                    bills={bills}
                                    lastInitBills={lastInitBills}
                                    filterType={filterType}
                                />
                            ) : viewType == "Khách Hàng" ? (
                                <RevenueReportCustomer
                                    bills={bills}
                                    customers={customers}
                                    lastInitBills={lastInitBills}
                                    filterType={filterType}
                                />
                            ) : (
                                <RevenueReportSupplier
                                    bills={bills}
                                />
                            )}
                        </Fragment>
                    )}


                </div>
            </Layout>
        );
    }
}