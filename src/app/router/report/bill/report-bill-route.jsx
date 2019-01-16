import React from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import {productApi} from "../../../api/product-api";
import {ReportBillItem} from "./report-bill-item";
import {securityApi} from "../../../api/security-api";
import {ReportEmployee} from "../revenue/report-employee";
import {ReportNotSuccessBill} from "./report-not-success-bill";
import {ReportBillFrom} from "./report-bill-from";
import {
    formatNumber,
    getBillProfit,
    getStartAndLastDayOfWeek,
    getTotalBill,
    getTotalBillWithoutVAT
} from "../../../common/common";
import {userInfo} from "../../../security/user-info";
import {permissionInfo} from "../../../security/premises-info";
import sumBy from "lodash/sumBy";
import {Select} from "../../../components/select/select";
import {RevenueReportBill} from "../revenue/revenue-report-bill";
import {ReportBillPaymentType} from "./report-bill-payment-type";
import {ReportBillColor} from "./report-bill-color";
import {ReportBillType} from "./report-bill-type";
export class ReportBillRoute extends React.Component {

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
            viewType: "Đơn Huỷ",
            types: [],
            colors: [],
            sales: [],
            florists: [],
            ships: []
        };

        productApi.getTypes().then((types) => {
            this.setState({types: types.map(t => t.name)})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: colors.map(t => t.name)})
        });

        securityApi.getSalesAndFlorist().then((users) => {
            const mapItem = (u) => ({
                user_id: u._id,
                name: u.name,
                username: u.username,
                role: u.role
            });

            this.setState({
                sales: users.filter(u => u.role == "sale").map(mapItem),
                florists: users.filter(u => u.role == "florist").map(mapItem),
                ships: users.filter(u => u.role == "ship").map(mapItem)
            })
        })
    }

    componentDidMount() {
        this.getReport();
    }

    getReport() {
        this.setState({loading: true});
        let {from, to} = this.state;
        billApi.getReportAll({from, to}).then(({bills, customers, vips, items}) => {
            this.setState({bills, customers, vips, items, loading: false})
        })
    }

    render() {
        let {loading, from, to, bills, viewType, types, colors, sales, florists, ships, customers} = this.state;

        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        if (permission[user.role].indexOf("report.report-bill") == -1) {
            return (
                <Layout activeRoute="Báo Cáo">
                    <PermissionDenie />
                </Layout>
            )
        }

        const components = {
            "Đơn Huỷ": (
                <ReportNotSuccessBill
                    bills={bills.filter(b => b.status == "Huỷ Đơn")}
                    customers={customers}
                    loading={loading}
                    name={'don-huy'}
                />
            ),
            "Đơn Khiếu Nại": (
                <ReportNotSuccessBill
                    bills={bills.filter(b => b.status == "Khiếu Nại")}
                    customers={customers}
                    loading={loading}
                    name={'khieu-nai'}
                />
            ),
            "Kênh Mua Hàng": (
                <ReportBillFrom
                    bills={bills}
                    loading={loading}
                />
            ),
            "Hình Thức Thanh Toán": (
                <ReportBillPaymentType
                    bills={bills}
                    loading={loading}
                />
            ),
            "Màu": (
                <ReportBillColor
                    bills={bills}
                    loading={loading}
                    colors={colors}
                />
            ),
            "Loại": (
                <ReportBillType
                    bills={bills}
                    loading={loading}
                    types={types}
                />
            )
        };

        return (
            <Layout activeRoute="Đơn Hàng">

                <div className="card bill-report-route">
                    <div className="card-title">
                        Báo cáo đơn hàng
                        <span className="text-small text-primary">{bills ? bills.length : 0} Đơn</span>

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
                                    onClick={() => this.getReport()}
                                    disabled={loading}
                            >
                                <span className="btn-text">Xem</span>
                                {loading &&
                                <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>

                        <Select
                            className="first-margin"
                            label="Theo"
                            value={viewType}
                            list={["Đơn Huỷ", "Đơn Khiếu Nại", "Kênh Mua Hàng", "Hình Thức Thanh Toán", "Màu", "Loại"]}
                            onChange={(viewType) => this.setState({viewType})}
                        />
                    </div>

                    { components[viewType]}

                </div>
            </Layout>
        );
    }
}