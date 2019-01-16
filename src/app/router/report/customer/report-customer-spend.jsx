import React from "react";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import sortBy from "lodash/sortBy";
import {formatNumber, getTotalBill} from "../../../common/common";
import sumBy from "lodash/sumBy";
import sum from "lodash/sum";
import {premisesInfo} from "../../../security/premises-info";
import {DataTable} from "../../../components/data-table/data-table";
import {PaginationDataTableOffline} from "../../../components/data-table/pagination-data-table-offline";
export class ReportCustomerSpend extends React.Component {

    constructor(props) {
        super(props);
    }

    columns = [{
        label: "Tên",
        display: (row) => row.customerName,
        width: "33.33%",
        minWidth: "150",
        sortBy: (row) => row.customerName
    }, {
        label: "Số Điện Thoại",
        display: (row) => row.customerPhone,
        sortBy: (row) => row.customerPhone,
        width: "33.33%",
        minWidth: "100",
    }, {
        label: "Tổng Chi",
        display: (row) => {

            let totalPay = sumBy(this.props.bills.filter(b => b.customerId == row._id), b => getTotalBill(b));
            const getTotalPay = (customerId, isOwe) => {
                let _bills = [];
                if (isOwe) _bills = this.props.bills.filter(b => b.isOwe);

                const customerBills = _bills.filter(b => b.customerId == customerId);
                return sum(customerBills.map(b => getTotalBill(b)))
            };

            const getPayOfPremises = (customerId, premises_id) => {
                const customerBills = this.props.bills.filter(b => b.customerId == customerId && b.premises_id == premises_id);
                return sum(customerBills.map(b => getTotalBill(b)))
            };

            let premises = premisesInfo.getPremises();

            return (
                <ColumnViewMore
                    header={formatNumber(totalPay)}
                    renderViewMoreBody={() => premises.filter(p => getPayOfPremises(row._id, p._id) > 0).map((p, index) => (
                        <div className="info-item" key={index}>
                            {p.name}: <b>{formatNumber(getPayOfPremises(row._id, p._id))}</b>
                        </div>
                    ))}
                    viewMoreText="Chi Tiết"
                    subText={getTotalPay(row._id, true) > 0 && <div className="text-danger">Nợ: {formatNumber(getTotalPay(row._id, true))}</div>}
                    isShowViewMoreText={totalPay > 0}
                />
            )
        },
        width: "33.33%",
        minWidth: "150",
        sortBy: (row) => sumBy(this.props.bills.filter(b => b.customerId == row._id), b => getTotalBill(b))
    }];

    render() {

        let {customers, bills, loading} = this.props;





        return (
            <PaginationDataTableOffline
                loading={loading}
                rows={sortBy(customers, row => -sumBy(bills.filter(b => b.customerId == row._id), b => getTotalBill(b)))}
                columns={this.columns}
            />
        );
    }
}