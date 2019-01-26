import React from "react";
import {DataTable} from "../../../components/data-table/data-table";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber} from "../../../common/common";
export class HistoryItemModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {items, onClose} = this.props;

        let columns = [{
            label: "Thời Gian Nhập",
            display: (row) => moment(row.created).format("DD/MM/YYYY"),
            width: "33.33%",
            minWidth: "150"
        }, {
            label: "Số Lượng",
            display: (item) => item.quantity,
            width: "33.33%",
            minWidth: "150"
        }, {
            label: "Giá Nhập",
            display: (item) => formatNumber(item.oriPrice),
            width: "33.33%",
            minWidth: "150"
        }];


        return (
            <div className="request-history-modal app-modal-box">
                <div className="modal-header">
                    <div className="modal-title">
                        Lịch sử xuất nhập
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    rows={sortBy(items, l => -l.created)}
                />

                <div className="modal-footer">
                    <button type="button" className="btn btn-link " data-dismiss="modal" onClick={() => onClose()}>Đóng</button>
                </div>
            </div>
        );
    }
}