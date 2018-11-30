import React from "react";
import {Layout} from "../../../components/layout/layout";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {billApi} from "../../../api/bill-api";
import {productApi} from "../../../api/product-api";
import {ReportBillItem} from "./report-bill-item";
import {securityApi} from "../../../api/security-api";
import {ReportEmployee} from "./report-employee";
import {ReportNotSuccessBill} from "./report-not-success-bill";
import {ReportBillFrom} from "./report-bill-from";
import {getStartAndLastDayOfWeek} from "../../../common/common";
import {userInfo} from "../../../security/user-info";
import {permissionInfo} from "../../../security/premises-info";
import {PermissionDenie} from "../revenue/revenue-report-route";
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
            viewType: "Nhân Viên",
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
        this.setState({loading: true, bills: [], customers: [], vips: []});
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
            "Sản Phẩm": (
                <ReportBillItem
                    bills={bills}
                    types={types}
                    colors={colors}
                />
            ),
            "Nhân Viên": (
                <ReportEmployee
                    bills={bills}
                    sales={sales}
                    florists={florists}
                    ships={ships}
                />
            ),
            "Đơn Huỷ": (
                <ReportNotSuccessBill
                    bills={bills.filter(b => b.status == "Huỷ Đơn")}
                    customers={customers}
                />
            ),
            "Đơn Khiếu Nại": (
                <ReportNotSuccessBill
                    bills={bills.filter(b => b.status == "Khiếu Nại")}
                    customers={customers}
                />
            ),
            "Kênh Mua Hàng": (
                <ReportBillFrom
                    bills={bills}
                />
            )
        };

        return (
            <Layout activeRoute="Báo Cáo">
                <div className="report-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo cáo đơn hàng</h1>
                    </div>

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

                    <div className="form-group">
                        <label>Báo cáo theo</label>
                        <select className="form-control"
                                value={viewType}
                                onChange={(e) => this.setState({viewType: e.target.value})}
                        >
                            <option value="Nhân Viên">Nhân Viên</option>
                            <option value="Đơn Huỷ">Đơn Huỷ</option>
                            <option value="Đơn Khiếu Nại">Đơn Khiếu Nại</option>
                            <option value="Kênh Mua Hàng">Kênh Mua Hàng</option>
                        </select>
                    </div>

                    { components[viewType]}


                </div>
            </Layout>
        );
    }
}