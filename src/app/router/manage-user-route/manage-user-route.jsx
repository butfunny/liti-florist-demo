import React from "react";
import {Layout} from "../../components/layout/layout";
import {securityApi} from "../../api/security-api";
import {userInfo} from "../../security/user-info";
import {modals} from "../../components/modal/modals";
import {ManageUserModal} from "./manage-user-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {premisesInfo} from "../../security/premises-info";
import {shopApi} from "../../api/shop-api";

export class ManageUserRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: null
        };

        securityApi.getUsers().then((users) => {
            this.setState({users})
        })

    }

    addUser() {

        let {users} = this.state;

        const handleClose = (user) => {
            securityApi.createUser(user).then((newUser) => {
                this.setState({users: users.concat(newUser)});
                modal.close();
            });
        };

        const modal = modals.openModal({
            content: (
                <ManageUserModal
                    user={{role: "sale"}}
                    usernames={users.map(u => u.username)}
                    onDismiss={() => modal.close()}
                    onClose={(user) => {
                        handleClose(user)
                    }}
                />
            )
        })
    }


    editUser(user) {
        let {users} = this.state;

        const handleClose = (user) => {
            securityApi.updateUser(user._id, {
                username: user.username,
                name: user.name,
                password: user.password,
                role: user.role
            }).then(() => {
                this.setState({
                    users: users.map(u => {
                        if (u._id == user._id) return user;
                        return u;
                    })
                });
                modal.close();
            });
        };

        const modal = modals.openModal({
            content: (
                <ManageUserModal
                    user={user}
                    usernames={users.map(u => u.username)}
                    onDismiss={() => modal.close()}
                    onClose={(user) => {
                        handleClose(user)
                    }}
                />
            )
        })
    }

    remove(user) {
        let {users} = this.state;

        confirmModal.show({
            title: `Xoá nhân viên ${user.name}?`,
            description: "Bạn có đồng ý xoá nhân viên này không?"
        }).then(() => {
            this.setState({
                users: users.filter(p => p._id != user._id)
            });
            securityApi.removeUser(user._id);
        })
    }

    render() {

        let {users} = this.state;
        const user = userInfo.getUser();

        const roles = {
            "admin": "Ban Giám Đốc",
            "mkt": "Marketing",
            "dvkh": "Dịch Vụ Khách Hàng",
            "sale": "Sale",
            "florist": "Florist",
            "ship": "Ship",
            "ns": "Nhân Sự",
            "kt": "Kế Toán"
        };

        return (
            <Layout
                activeRoute="Tài Khoản"
            >
                <div className="manage-premises-route manage-user-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Quản Lý Nhân Viên</h1>
                        <div className="avatar-group mt-3">
                        </div>
                    </div>

                    <p className="ct-lead">
                        Thêm mới chỉnh sửa hoặc xoá nhân viên bán hàng.
                    </p>

                    <hr/>

                    <div className="margin-bottom">
                        <button type="button" className="btn btn-primary" onClick={() => this.addUser()}>Thêm Nhân
                            Viên
                        </button>
                    </div>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Tài Khoản</th>
                            <th scope="col">Tác Vụ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users && users.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div>Tên tài khoản: <b>{item.username}</b></div>
                                    <div>{item.name &&
                                    <span>{item.name} - </span>}<b>{roles[item.role]}</b></div>
                                </td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm"
                                            onClick={() => this.editUser(item)}>
                                        <i className="fa fa-pencil"/>
                                    </button>
                                    {user._id != item._id && (
                                        <button className="btn btn-outline-danger btn-sm"
                                                onClick={() => this.remove(item)}>
                                            <i className="fa fa-trash"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                </div>
            </Layout>
        );
    }
}