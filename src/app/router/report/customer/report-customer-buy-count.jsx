import React from "react";
import {roles} from "../../../common/constance";
import {formatNumber} from "../../../common/common";
import {DataTable} from "../../../components/data-table/data-table";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import sortBy from "lodash/sortBy";
export class ReportCustomerBuyCount extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {groupedBills, loading, customers} = this.props;

        const groups = [
            {label: "0 -> 1", logic: (b) => b.value.length <= 1},
            {label: "2 -> 4", logic: (b) => b.value.length <= 4 && b.value.length >= 2},
            {label: "5 -> 10", logic: (b) => b.value.length <= 10 && b.value.length >= 5},
            {label: "11+", logic: (b) => b.value.length >= 11}
        ];


        let columns = [{
            label: "Số Lần Mua",
            display: (row) => row.label,
            width: "33.33%",
            minWidth: "150",
            sortBy: (row) => row.label
        }, {
            label: "Số Khách",
            display: (row) => groupedBills.filter(b => row.logic(b)).length,
            sortBy: (row) => groupedBills.filter(b => row.logic(b)).length,
            width: "33.33%",
            minWidth: "150",
        }, {
            label: "Chi Tiết",
            display: (row) => groupedBills.filter(b => row.logic(b)).length > 0 && (
                <ColumnViewMore
                    viewMoreText={`Xem toàn bộ ${groupedBills.filter(b => row.logic(b)).length} khách`}
                    renderViewMoreBody={() => sortBy(groupedBills.filter(b => row.logic(b)), c => -c.value.length).map((customer, index) => {
                        let c = customers.find(c => c._id == customer.key);
                        return (
                            <div key={index} className="info-item">
                                {c.customerName} - {c.customerPhone} <span className="text-primary">({customer.value.length} lần)</span>
                            </div>
                        )
                    })}
                    isShowViewMoreText
                />
            ),
            width: "33.33%",
            minWidth: "150",
        }];


        return (
            <DataTable
                rows={groups}
                columns={columns}
                loading={loading}
            />
        );
    }
}