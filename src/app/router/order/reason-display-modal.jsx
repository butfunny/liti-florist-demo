import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import moment from "moment";
import sortBy from "lodash/sortBy";
import {DataTable} from "../../components/data-table/data-table";
export class ReasonDisplayModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {logs, onDismiss} = this.props;

        let columns = [{
            label: "Thời Gian",
            display: (log) => moment(log.update_time).format("DD/MM/YYYY HH:mm"),
            width: "30%",
            minWidth: "150"
        }, {
            label: "Nhân Viên",
            display: (log) => log.user ? log.user.username : log.sale_name,
            width: "20%",
            minWidth: "150"
        }, {
            label: "Lý Do",
            display: (log) => log.reason,
            width: "50%",
            minWidth: "150"
        }];

        return (
            <div className="app-modal-box bill-catalog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lý do cập nhật</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <DataTable
                        columns={columns}
                        rows={sortBy(logs, l => -l.update_time)}
                    />

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link " data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    </div>
                </div>
            </div>
        );
    }
}