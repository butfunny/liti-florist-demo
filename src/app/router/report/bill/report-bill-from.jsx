import React from "react";
import sortBy from "lodash/sortBy";
import {formatNumber} from "../../../common/common";
import {viaTypes} from "../../../common/constance";
export class ReportBillFrom extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {bills} = this.props;

        let types = viaTypes.map((type) => ({
            name: type,
            total: bills.filter(b => b.to && b.to.buyerFrom == type).length
        }));

        return (
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
        );
    }
}