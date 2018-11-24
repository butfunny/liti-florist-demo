import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {minLength, required} from "../../components/form/validations";
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
            ]},
            {"name" : [required("Tên nhân viên")]}
        ];

        if (!user._id) validations.push({"password" : [required("Mật khẩu"), minLength(6, "Mật khẩu")]},);


        const roles = [{
            value: "admin",
            label: "Ban Giám Đốc"
        }, {
            value: "mkt",
            label: "Marketing"
        }, {
            value: "dvkh",
            label: "Dịch Vụ Khách Hàng"
        }, {
            value: "sale",
            label: "Sale"
        }, {
            value: "florist",
            label: "Florist"
        }, {
            value: "ship",
            label: "Ship"
        }, {
            value: "ns",
            label: "Nhân Sự"
        }, {
            value: "kt",
            label: "Kế Toán"
        }];

        return (
            <div className="app-modal-box ">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{user.id ? `Sửa thông tin của ${user.name}` : "Thêm nhân viên"}</h5>
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
                                        disabled={user._id}
                                        value={user.username}
                                        onChange={(e) => this.setState({user: {...user, username: e.target.value}})}
                                        placeholder="Tên Tài Khoản"
                                        error={getInvalidByKey("username")}
                                    />

                                    <Input
                                        value={user.name}
                                        onChange={(e) => this.setState({user: {...user, name: e.target.value}})}
                                        placeholder="Tên Nhân Viên"
                                        error={getInvalidByKey("name")}
                                    />

                                    <div className="form-group">
                                        <select className="form-control" value={user.role}
                                                onChange={(e) => this.setState({user: {...user, role: e.target.value}})}>
                                            { roles.map((role, index) => (
                                                <option value={role.value} key={index}>{role.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    { !user._id && (
                                        <Input
                                            value={user.password}
                                            type="password"
                                            onChange={(e) => this.setState({user: {...user, password: e.target.value}})}
                                            placeholder="Mật Khẩu"
                                            error={getInvalidByKey("password")}
                                        />
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-info btn-icon">
                                        <span className="btn-inner--text">Lưu</span>
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