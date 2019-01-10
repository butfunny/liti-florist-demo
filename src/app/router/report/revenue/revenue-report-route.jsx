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
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
import {paymentTypes} from "../../../common/constance";
import {RevenueReportSupplier} from "./revenue-report-supplier";
import {Select} from "../../../components/select/select";
import {CSVLink} from "react-csv";


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

                        <Select
                            label="Báo Cáo Theo"
                            value={viewType}
                            onChange={(viewType) => this.setState({viewType})}
                            list={["Khách Hàng", "Cửa Hàng"]}
                        />
                    </div>

                    <RevenueReportBill
                        bills={bills}
                        lastInitBills={lastInitBills}
                        filterType={filterType}
                    />
                </div>

                {/*{ !loading && (*/}
                    {/*<Fragment>*/}
                        {/*{ viewType == "Cửa Hàng" ? (*/}
                            {/*<RevenueReportBill*/}
                                {/*bills={bills}*/}
                                {/*lastInitBills={lastInitBills}*/}
                                {/*filterType={filterType}*/}
                            {/*/>*/}
                        {/*) :  (*/}
                            {/*<RevenueReportCustomer*/}
                                {/*bills={bills}*/}
                                {/*customers={customers}*/}
                                {/*lastInitBills={lastInitBills}*/}
                                {/*filterType={filterType}*/}
                            {/*/>*/}
                        {/*)}*/}

                    {/*</Fragment>*/}
                {/*)}*/}



            </Layout>
        );
    }
}