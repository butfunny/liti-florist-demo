import React, {Fragment} from "react";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import {formatNumber} from "../../../common/common";
import {CSVLink} from "react-csv";
export class ReportBillItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            viewType: "Loại"
        }
    }

    render() {

        let {bills, types, colors, loading} = this.props;
        let {viewType} = this.state;



        let itemsCount = types.map(t => ({
            name: t,
            total: sumBy(bills, (bill) => {
                for (let item of bill.items) {
                    if (item.flowerType && item.flowerType == t) return 1
                }
                return 0;
            })
        }));

        let itemsColor = colors.map(t => ({
            name: t,
            total: sumBy(bills, (bill) => {
                for (let item of bill.items) {
                    if (item.color && item.color == t) return 1
                }
                return 0;
            })
        }));

        let csvDataType = [[
            "Loại",
            "Số Lượng"
        ]];

        for (let item of sortBy(itemsCount, c => -c.total)) {
            csvDataType.push([
                item.name,
                item.total
            ])
        }


        let csvDataColor = [[
            "Màu",
            "Số Lượng"
        ]];

        for (let item of sortBy(itemsColor, c => -c.total)) {
            csvDataColor.push([
                item.name,
                item.total
            ])
        }


        return (
            <Fragment>
                <div className="form-group col-md-6">

                    {!loading && (
                        <CSVLink
                            data={csvDataType}
                            filename={`bao-cao-loai-san-pham.csv`}
                            className="btn btn-info btn-icon btn-excel btn-sm">
                            <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                            <span className="btn-inner--text">Xuất Excel</span>
                        </CSVLink>
                    )}


                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Loại</th>
                            <th scope="col">Số Lượng</th>
                        </tr>
                        </thead>
                        <tbody>
                        { sortBy(itemsCount, c => -c.total).map((item, index) => (
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

                <div className="col-md-6">

                    {!loading && (
                        <CSVLink
                            data={csvDataColor}
                            filename={`bao-cao-mau-san-pham.csv`}
                            className="btn btn-info btn-icon btn-excel btn-sm">
                            <span className="btn-inner--icon"><i className="fa fa-file-excel-o"/></span>
                            <span className="btn-inner--text">Xuất Excel</span>
                        </CSVLink>
                    )}

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Màu</th>
                            <th scope="col">Số Lượng</th>
                        </tr>
                        </thead>
                        <tbody>
                        { sortBy(itemsColor, c => -c.total).map((item, index) => (
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
            </Fragment>
        );
    }
}