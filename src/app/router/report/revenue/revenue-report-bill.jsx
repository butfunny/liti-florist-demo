import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber, getTotalBill} from "../../../common/common";
import {premisesInfo} from "../../../security/premises-info";
import sumBy from "lodash/sumBy";
import {modals} from "../../../components/modal/modals";
import {CustomerBillModal} from "../../customers/customer-bill-modal";
import {CSVLink} from "react-csv";
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

        let {bills} = this.props;

        let premises = premisesInfo.getPremises();
        premises = premises.map(p => ({
            ...p,
            totalGet: sumBy(bills, b => b.premises_id == p._id ? getTotalBill(b) : 0),
            totalBill: bills.filter(b => b.premises_id == p._id).length
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



        return (
            <div>

                <CSVLink
                    data={CSVdata}
                    filename={"bao-cao-doanh-thu-cua-hang.csv"}
                    className="btn btn-info btn-icon btn-excel btn-sm">
                    <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                    <span className="btn-inner--text">Xuất Excel</span>
                </CSVLink>

                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">Cửa Hàng</th>
                        <th scope="col">Tổng Thu</th>
                        <th scope="col" style={{width: "150px"}}/>
                    </tr>
                    </thead>
                    <tbody>
                    { sortBy(premises, c => -c.totalGet).map((premise, index) => (
                        <tr key={index}>
                            <td>
                                <div>{premise.name}</div>
                                Số đơn: {premise.totalBill}
                            </td>

                            <td>
                                {formatNumber(premise.totalGet)}
                            </td>

                            <td>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => this.viewBills(premise)}>
                                    Xem lịch sử
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}