import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {isSame, minLength, required} from "../../components/form/validations";
export class UpdateReasonModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reason: ""
        }
    }

    render() {

        let {reason} = this.state;
        let {onDismiss, onClose} = this.props;

        let validations = [
            {"reason": [required("Lý do")]},
        ];

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Cập Nhật Hoá Đơn</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => onClose(reason)}
                        formValue={this.state}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        value={reason}
                                        onChange={(e) => this.setState({reason: e.target.value})}
                                        placeholder="Lý do"
                                        error={getInvalidByKey("reason")}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit"
                                            className="btn btn-primary btn-icon">
                                        <span className="btn-inner--text">Cập Nhật</span>
                                    </button>
                                </div>
                            </Fragment>
                        )}
                    />
                </div>
            </div>
        );
    }
}