import React, {Fragment} from "react";
import {Form} from "../form/form";
import {Input} from "../input/input";
import {isSame, minLength, required} from "../form/validations";
import {securityApi} from "../../api/security-api";
export class ChangePasswordModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            oldPassword: "",
            newPassword: "",
            retypePassword: "",
            saving: false
        }
    }

    submit() {
        let {oldPassword, newPassword} = this.state;

        this.setState({saving: true});

        securityApi.changePassword({
            oldPassword,
            newPassword
        }).then((resp) => {
            if (resp.error) {
                this.setState({error: true, saving: false})
            } else {
                this.props.onDone();
            }
        })
    }

    render() {

        let {oldPassword, newPassword, retypePassword, saving, error} = this.state;
        let {onClose} = this.props;

        let validations = [
            {"oldPassword": [required("Mật khẩu cũ"), minLength(6, "Mật khẩu cũ")]},
            {"newPassword": [required("Mật khẩu mới"), minLength(6, "Mật khẩu mới")]},
            {"retypePassword": [required("Nhập lại mật khẩu mới"), isSame(newPassword, "Nhập lại mật khẩu mới")]},
        ];

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Đổi Mật Khẩu</h5>
                        <button type="button" className="close" onClick={() => onClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => this.submit()}
                        formValue={this.state}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">

                                    { error && (
                                        <div className="error-text">
                                            Sai mật khẩu cũ
                                        </div>
                                    )}

                                    <Input
                                        value={oldPassword}
                                        onChange={(e) => this.setState({oldPassword: e.target.value})}
                                        label="Mật Khẩu Cũ"
                                        type="password"
                                        error={getInvalidByKey("oldPassword")}
                                    />

                                    <Input
                                        value={newPassword}
                                        onChange={(e) => this.setState({newPassword: e.target.value})}
                                        label="Mật Khẩu Mới"
                                        type="password"
                                        error={getInvalidByKey("newPassword")}
                                    />

                                    <Input
                                        value={retypePassword}
                                        onChange={(e) => this.setState({retypePassword: e.target.value})}
                                        label="Nhập Lại Mật Khẩu"
                                        type="password"
                                        error={getInvalidByKey("retypePassword")}
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