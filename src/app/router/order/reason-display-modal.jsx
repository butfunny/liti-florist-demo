import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import moment from "moment";
import sortBy from "lodash/sortBy";
export class ReasonDisplayModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {logs, onDismiss} = this.props;
        return (
            <div className="app-modal-box bill-catalog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lý do cập nhật</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        { sortBy(logs, l => l.update_time).reverse().map((log, index) => (
                            <div className="product" key={index}>
                                <b>{log.user ? log.user.username : log.sale_name} </b> đã cập nhật với lí do <b>{log.reason}</b> vào lúc {moment(log.update_time).format("HH:mm - DD/MM/YYYY")}
                            </div>
                        ))}

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    </div>
                </div>
            </div>
        );
    }
}