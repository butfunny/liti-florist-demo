import React, {Fragment} from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import {formatNumber, getStartAndLastDayOfWeek, getTotalBill, getTotalBillWithoutVAT} from "../../../common/common";
import sumBy from "lodash/sumBy";
import {RevenueReportCustomer} from "./revenue-report-customer";
import {RevenueReportBill} from "./revenue-report-bill";
import {userInfo} from "../../../security/user-info";
import {permissionInfo} from "../../../security/premises-info";
import {paymentTypes} from "../../../common/constance";

export const PermissionDenie = () => (
    <div>
        Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
    </div>
)

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
            let {bills, customers, vips, items} = resp[0];
            this.setState({bills, customers, vips, items, loading: false, lastInitBills: resp[1].bills, initBills: resp[0]})
        })


    }

    getReport() {
        this.setState({loading: true, bills: [], customers: [], vips: []});
        let {from, to} = this.state;
        billApi.getReportAll({from, to}).then(({bills, customers, vips, items}) => {
            this.setState({bills, customers, vips, items, loading: false})
        })
    }



    render() {
        let {loading, from, to, viewType, filterType, initBills, lastInitBills} = this.state;

        let {customers, items, bills} = filterType == "Trong Tuần" ? initBills : this.state;

        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        if (permission[user.role].indexOf("report.report-revenue") == -1) {
            return (
                <Layout activeRoute="Báo Cáo">
                    <PermissionDenie />
                </Layout>
            )
        }

        return (
            <Layout activeRoute="Báo Cáo">
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

                    { filterType == "Chọn Ngày" && (
                        <div className="report-header row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label">Từ ngày</label>
                                    <DatePicker
                                        value={from}
                                        onChange={(from) => {
                                            this.setState({from})
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label">Tới ngày</label>
                                    <DatePicker
                                        value={to}
                                        onChange={(to) => this.setState({to})}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <button className="btn btn-info btn-sm btn-get btn-icon"
                                        disabled={loading}
                                        onClick={() => this.getReport()}>
                                    Xem Hoá Đơn

                                    { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>

                        </div>
                    )}

                    { !loading && (
                        <Fragment>
                            <div className="form-group">
                                <h6>
                                    Tổng Đơn: <b className="text-primary">{bills ? bills.length : 0}</b>
                                </h6>
                                <h6>
                                    Khách Mới: <b className="text-primary">{bills ? bills.filter(b => b.isNewCustomer).length : 0}</b>
                                </h6>
                                <h6>
                                    Tổng Thu: <b className="text-primary">{formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBill(b)))}</b>
                                </h6>
                                <h6>
                                    Tổng Thu chưa bao gồm VAT: <b className="text-primary">{bills ? formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBillWithoutVAT(b))) : 0}</b>
                                </h6>

                                <h6>
                                    Lợi Nhuận:<b className="text-primary">{formatNumber(sumBy(bills, b => b.status != "Done" ? 0 : getTotalBill(b)) - sumBy(items, b => b.price))}</b>
                                </h6>
                            </div>

                            <div className="form-group">
                                <label>Báo cáo theo</label>
                                <select className="form-control"
                                        value={viewType}
                                        onChange={(e) => this.setState({viewType: e.target.value})}
                                >
                                    <option value="Khách Hàng">Khách Hàng</option>
                                    <option value="Cửa Hàng">Cửa Hàng</option>
                                </select>
                            </div>

                            { viewType == "Cửa Hàng" ? (
                                <RevenueReportBill
                                    bills={bills}
                                    lastInitBills={lastInitBills}
                                    filterType={filterType}
                                />
                            ) : (
                                <RevenueReportCustomer
                                    bills={bills}
                                    customers={customers}
                                    lastInitBills={lastInitBills}
                                    filterType={filterType}
                                />
                            )}
                        </Fragment>
                    )}


                </div>
            </Layout>
        );
    }
}