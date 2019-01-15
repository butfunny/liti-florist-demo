import React from "react";
import sumBy from "lodash/sumBy";
import {keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import sortBy from "lodash/sortBy";
import {DataTable} from "../../../components/data-table/data-table";

export class ReportCustomerType extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {loading, customers, bills, types} = this.props;


        let itemTypes = types.map(t => ({
            name: t,
            total: sumBy(bills, (bill) => {
                for (let item of bill.items) {
                    if (item.flowerType && item.flowerType == t) return 1
                }
                return 0;
            }),
            customers: keysToArray(groupBy(bills.filter((bill) => {
                for (let item of bill.items) {
                    if (item.flowerType && item.flowerType == t) return 1
                }
                return 0;
            }), "customerId"))
        }));



        let columns = [{
            label: "Màu",
            display: (row) => row.name,
            width: "33.33%",
            minWidth: "150",
            sortBy: (row) => row.name
        }, {
            label: "Số Lần Mua",
            display: (row) => row.total,
            sortBy: (row) => row.total,
            width: "33.33%",
            minWidth: "150",
        }, {
            label: "Chi Tiết",
            display: (row) => row.customers.length > 0 && (
                <ColumnViewMore
                    viewMoreText={`Xem toàn bộ ${row.customers.length} khách`}
                    renderViewMoreBody={() => sortBy(row.customers, c => -c.value.length).map((customer, index) => {
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
                rows={itemTypes}
                columns={columns}
                loading={loading}
            />
        );
    }
}