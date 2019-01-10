import React from "react";
import {Checkbox} from "../../components/checkbox/checkbox";
export class ReportBillModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reasons: []
        }
    }

    render() {

        let {reasons} = this.state;
        let {type, list, onDismiss, onClose} = this.props;

        return (
            <div className="app-modal-box bill-report-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lý do {type}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        { list.map((reason, index) => (
                            <Checkbox
                                key={index}
                                value={reasons.indexOf(reason) > -1}
                                onChange={() => {
                                    if (reasons.indexOf(reason) > -1) this.setState({reasons: reasons.filter(r => r != reason)});
                                    else this.setState({reasons: reasons.concat(reason)});
                                }}
                                label={reason}
                            />
                        ))}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                        <button type="submit" className="btn btn-primary btn-icon" onClick={() => onClose(reasons)}>
                            Lưu
                        </button>

                    </div>
                </div>
            </div>
        );
    }
}