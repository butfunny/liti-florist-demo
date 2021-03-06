import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {minLength, required} from "../../components/form/validations";
import {roles} from "../../common/constance";
import {Select} from "../../components/select/select";
export class ManageUserModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: props.user
        }
    }

    render() {

        let { onDismiss, onClose, usernames} = this.props;
        let {user, saving} = this.state;

        let validations = [
            {"username" : [required("Tên tài khoản"), (val) => ({
                    text: "Tên tài khoản đã trùng",
                    valid: user._id ? true : usernames.indexOf(val) == -1
                })
            ]}
        ];

        if (!user._id) validations.push({"password" : [required("Mật khẩu"), minLength(6, "Mật khẩu")]});

        return (
            <div className="app-modal-box ">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{user._id ? `Sửa thông tin của ${this.props.user.username}` : "Thêm nhân viên"}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => {
                            this.setState({saving: true});
                            onClose(user);
                        }}
                        formValue={user}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        readOnly={user._id}
                                        value={user.username}
                                        onChange={(e) => this.setState({user: {...user, username: e.target.value}})}
                                        label="Tên Tài Khoản"
                                        error={getInvalidByKey("username")}
                                    />


                                    <div className="form-group">
                                        <Select
                                            value={user.role}
                                            onChange={(role) => this.setState({user: {...user, role}})}
                                            list={roles.map(r => r.value)}
                                            displayAs={(role) => {
                                                let found = roles.find(r => r.value == role);
                                                return found ? found.label : null
                                            }}
                                            label="Chức Vụ"
                                        />

                                    </div>

                                    { !user._id && (
                                        <Input
                                            value={user.password}
                                            type="password"
                                            onChange={(e) => this.setState({user: {...user, password: e.target.value}})}
                                            label="Mật Khẩu"
                                            error={getInvalidByKey("password")}
                                        />
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-primary">
                                        <span className="btn-text">Lưu</span>
                                        { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
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