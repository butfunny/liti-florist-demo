import React from "react";
import {Layout} from "../../components/layout/layout";
import {securityApi} from "../../api/security-api";
import {userInfo} from "../../security/user-info";
import {modals} from "../../components/modal/modals";
import {ManageUserModal} from "./manage-user-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {premisesInfo} from "../../security/premises-info";
import {shopApi} from "../../api/shop-api";
import {roles} from "../../common/constance";
import {DataTable} from "../../components/data-table/data-table";
import {ButtonGroup} from "../../components/button-group/button-group";

export class ManageUserRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: []
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
            title: `Xoá tài khoản ${user.username}?`,
            description: "Bạn có đồng ý xoá tài khoản này không?"
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

        let getActions = (item) => {
            let ret = [{
                name: "Sửa",
                icon: <i className="fa fa-pencil-square-o"/>,
                click: () => this.editUser(item)
            }];

            if (user._id != item._id) {
                ret.push({
                    name: "Xóa",
                    icon: <i className="fa fa-trash text-danger"/>,
                    click: () => this.remove(item)
                })
            }

            return ret;
        };



        let columns = [{
            label: "Tài Khoản",
            width: "45%",
            display: (row) => row.username,
            sortBy: (row) => row.username,
            minWidth: "150"
        }, {
            label: "Chức Vụ",
            width: "45%",
            display: (row) => roles.find(r => r.value == row.role).label,
            sortBy: (row) => roles.find(r => r.value == row.role).label,
            minWidth: "300"
        }, {
            label: "",
            width: "10%",
            display: (row) => (
                <ButtonGroup
                    actions={getActions(row)}
                />
            ),
            className: "text-right",
            minWidth: "60"
        }];


        return (
            <Layout
                activeRoute="Quản Lý Tài Khoản"
            >

                <div className="card">
                    <div className="card-title">
                        Danh Sách Tài Khoản
                    </div>

                    <div className="card-body">
                        <button type="button" className="btn btn-primary btn-medium" onClick={() => this.addUser()}>Thêm</button>
                    </div>

                    <DataTable
                        rows={users}
                        columns={columns}
                    />
                </div>
            </Layout>
        );
    }
}