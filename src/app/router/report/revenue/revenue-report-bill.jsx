import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber, getTotalBill} from "../../../common/common";
import {premisesInfo} from "../../../security/premises-info";
import sumBy from "lodash/sumBy";
import {modals} from "../../../components/modal/modals";
import {CustomerBillModal} from "../../customers/customer-bill-modal";
import {CSVLink} from "react-csv";
import {DataTable} from "../../../components/data-table/data-table";
export class RevenueReportBill extends React.Component {

    constructor(props) {
        super(props);
    }

    viewBills(premise) {
        let {bills} = this.props;

        const modal = modals.openModal({
            content: (
                <CustomerBillModal
                    bills={bills.filter(b => b.premises_id == premise._id)}
                    onClose={() => modal.close()}
                />
            )
        })
    }

    render() {

        let {bills, filterType, lastInitBills, loading} = this.props;

        let premises = premisesInfo.getPremises();
        premises = premises.map(p => ({
            ...p,
            totalGet: sumBy(bills, b => b.premises_id == p._id ? getTotalBill(b) : 0),
            totalBill: bills.filter(b => b.premises_id == p._id).length,
            totalLastGet: sumBy(lastInitBills, b => b.premises_id == p._id ? getTotalBill(b) : 0)

        }));

        let CSVdata = [[
            "Tên cửa hàng",
            "Số đơn",
            "Doanh Thu"
        ]];

        for (let premise of premises) {
            CSVdata.push([
                premise.name,
                premise.totalBill,
                premise.totalGet
            ])
        };


        let columns = [{
            label: "Cửa Hàng",
            display: (premise) => premise.name,
            width: "33.33%",
            minWidth: "150",
            sortBy: (premise) => premise.name
        }, {
            label: "Tổng Đơn",
            display: (premise) => formatNumber(premise.totalBill),
            width: "33.33%",
            minWidth: "150",
            sortBy: (premise) => premise.totalBill
        }, {
            label: "Tổng Tiền",
            display: (premise) => (
                <div>
                    {formatNumber(premise.totalGet)}
                    { filterType == "Trong Tuần" && premise.totalGet != premise.totalLastGet && (
                        <span style={{paddingLeft: "5px"}}>
                            { premise.totalGet > premise.totalLastGet ? (
                                <span className="text-success"><i className="fa fa-arrow-up"/> ({formatNumber(premise.totalGet - premise.totalLastGet)})</span>
                            ) : (
                                <span className="text-danger"><i className="fa fa-arrow-down"/> ({formatNumber(premise.totalGet - premise.totalLastGet)})</span>
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
                rows={premises}
                rowStyling={(premise) => {
                    if (filterType == "Trong Tuần" && && premise.totalGet != premise.totalLastGet) {
                        if (premise.totalGet > premise.totalLastGet) return {}
                        return {}
                    }
                }}
            />
        );
    }
}