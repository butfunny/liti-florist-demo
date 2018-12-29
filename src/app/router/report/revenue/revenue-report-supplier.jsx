import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber} from "../../../common/common";
export class RevenueReportSupplier extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bills} = this.props;

        let mapSuppliers = [];
        bills.forEach((bill) => {
            for (let item of bill.selectedFlower) {
                let found = mapSuppliers.find(m => m.name == item.supplier);
                if (found) {
                    found.qty += item.quantity
                } else {
                    mapSuppliers.push({
                        name: item.supplier,
                        qty: item.quantity
                    })
                }
            }
        });

        const getTotalBill = (supp) => bills.filter(b => b.selectedFlower.map(b => b.supplier).indexOf(supp.name) > -1).length;


        return (
            <div className="revenue-report-supplier">
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">Nhà cung cấp</th>
                        <th scope="col">Tổng Đơn</th>
                        <th scope="col">Tổng Hàng</th>
                    </tr>
                    </thead>
                    <tbody>
                    { mapSuppliers.map((supp, index) => (
                        <tr key={index}>
                            <td>
                                {supp.name}
                            </td>

                            <td>
                                {formatNumber(getTotalBill(supp))}
                            </td>

                            <td>
                                {formatNumber(supp.qty)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}