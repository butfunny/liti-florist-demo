import React, {Fragment} from "react";
import {Form} from "../form/form";
import {Input} from "../input/input";
import {isSame, minLength, minVal, required} from "../form/validations";
import {configApi} from "../../api/config-api";
export class ConfigModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            config: {}

        };

        configApi.get().then((config) => {
            this.setState({config})
        })
    }

    submit() {
        configApi.update(this.state.config).then(() => {
            this.props.onDone();
        })
    }

    render() {

        let {config, saving} = this.state;
        let {onClose} = this.props;

        let validations = [
            {"max_day_view_report": [required("Giới hạn ngày xem báo cáo"), minVal("Giới hạn ngày xem báo cáo", 0)]},
        ];

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Cài Đặt</h5>
                        <button type="button" className="close" onClick={() => onClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>



                    <Form
                        onSubmit={() => this.submit()}
                        formValue={config}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        value={config.max_day_view_report}
                                        onChange={(e) => this.setState({config: {...config, max_day_view_report: e.target.value}})}
                                        label="Giới hạn ngày xem báo cáo"
                                        error={getInvalidByKey("max_day_view_report")}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onClose()}>Đóng</button>
                                    <button type="submit"
                                            disabled={saving}
                                            className="btn btn-primary btn-icon">
                                        <span className="btn-inner--text">Cập Nhật</span>
                                        { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
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