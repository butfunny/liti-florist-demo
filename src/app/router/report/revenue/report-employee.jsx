import React, {Fragment} from "react";
import concat from "lodash/concat";
import sortBy from "lodash/sortBy";
import {formatNumber, getSalary, getTotalBill} from "../../../common/common";
import sumBy from "lodash/sumBy";
import moment from "moment";
import {premisesInfo} from "../../../security/premises-info";
import {modals} from "../../../components/modal/modals";
import {CSVLink} from "react-csv";
import {securityApi} from "../../../api/security-api";
import {DataTable} from "../../../components/data-table/data-table";
import {roles} from "../../../common/constance";
export class ReportEmployee extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sales: [],
            florists: [],
            ships: []
        };

        securityApi.getSalesAndFlorist().then((users) => {
            const mapItem = (u) => ({
                name: u.name,
                username: u.username,
                role: u.role,
                _id: u._id
            });

            this.setState({
                sales: users.filter(u => u.role == "sale").map(mapItem),
                florists: users.filter(u => u.role == "florist").map(mapItem),
                ships: users.filter(u => u.role == "ship").map(mapItem)
            })
        })
    }

    render() {

        let {bills, loading, lastInitBills, filterType} = this.props;
        let {sales, florists, ships} = this.state;

        let employees = concat(sales, florists, ships);

        employees = employees.map((e) => ({
            ...e,
            totalGet: sumBy(bills, b => {
                if (b.sales.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }


                if (b.florists.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                if (b.ships.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                return 0;
            }),
            totalLastGet: sumBy(lastInitBills, b => {
                if (b.sales.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                if (b.florists.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

                if (b.ships.find(u => u.username == e.username)) {
                    return getSalary(e, b).money
                }

            return 0;
            })
        }));

        let columns = [{
            label: "Tên",
            display: (employee) => employee.username,
            width: "33.33%",
            minWidth: "150",
            sortBy: (employee) => employee.username
        }, {
            label: "Chức Vụ",
            display: (row) => roles.find(r => r.value == row.role).label,
            sortBy: (row) => roles.find(r => r.value == row.role).label,
            width: "33.33%",
            minWidth: "150",
        }, {
            label: "Tổng Thu",
            display: (employee) => (
                <div>
                    {formatNumber(employee.totalGet)}
                    { filterType == "Trong Tuần" && employee.totalGet != employee.totalLastGet && (
                        <span style={{paddingLeft: "5px"}}>
                            { employee.totalGet > employee.totalLastGet ? (
                                <span className="text-success"><i className="fa fa-arrow-up"/> ({formatNumber(employee.totalGet - employee.totalLastGet)})</span>
                            ) : (
                                <span className="text-danger"><i className="fa fa-arrow-down"/> ({formatNumber(employee.totalGet - employee.totalLastGet)})</span>
                            )}
                        </span>
                    )}
                </div>
            ),
            width: "33.33%",
            minWidth: "150",
            sortBy: (premise) => premise.totalGet
        }];


        return (
            <DataTable
                loading={loading}
                columns={columns}
                rows={employees}
                rowStyling={(premise) => {
                    if (filterType == "Trong Tuần" && premise.totalGet != premise.totalLastGet) {
                        if (premise.totalGet > premise.totalLastGet) return {background: "rgb(29,201,183, .1)"};
                        return {background: "rgb(253,57,122, .1)"};
                    }
                }}
            />
        );
    }
}


