import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber} from "../../../common/common";
import {viaTypes} from "../../../common/constance";
import {getCSVData} from "../../order/excel";
import {CSVLink} from "react-csv";
export class ReportBillFrom extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bills, loading} = this.props;

        let types = viaTypes.map((type) => ({
            name: type,
            total: bills.filter(b => b.to && b.to.buyerFrom == type).length
        }));

        let csvData = [[
            "Kênh mua hàng",
            "Số đơn"
        ]];

        for (let item of sortBy(types, c => -c.total)) {
            csvData.push([
                item.name,
                item.total
            ])
        }

        return (
            <div>
                {!loading && (
                    <CSVLink
                        data={csvData}
                        filename={`bao-cao-kenh-mua-hang.csv`}
                        className="btn btn-info btn-icon btn-excel btn-sm">
                        <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                        <span className="btn-inner--text">Xuất Excel</span>
                    </CSVLink>
                )}

                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col">Kênh mua hàng</th>
                        <th scope="col">Số đơn</th>
                    </tr>
                    </thead>
                    <tbody>
                    { sortBy(types, c => -c.total).map((item, index) => (
                        <tr key={index}>
                            <td>
                                <div>{item.name}</div>
                            </td>

                            <td>
                                {formatNumber(item.total)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}