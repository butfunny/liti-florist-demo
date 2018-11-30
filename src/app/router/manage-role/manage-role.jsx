import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {securityApi} from "../../api/security-api";
import {permissions, roles} from "../../common/constance";
import groupBy from "lodash/groupBy";
import {formatNumber, keysToArray} from "../../common/common";
import {Checkbox} from "../../components/checkbox/checkbox";
import {permissionInfo} from "../../security/premises-info";



export class ManageRole extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            permission: permissionInfo.getPermission()
        };
    }

    render() {


        let {permission} = this.state;

        return (
            <Layout
                activeRoute="Tài Khoản"
            >
                <div className="manage-role">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Quản lý phân quyền</h1>
                    </div>

                    <div className="table-permission">
                        <div className="column-fixed">
                            <div className="column-item">
                                Chức năng
                            </div>

                            { keysToArray(groupBy(permissions, "father")).map((item, index) => (
                                <Fragment key={index}>
                                    <div className="column-item">
                                        <div className="tb-item">
                                            {item.key}
                                        </div>

                                    </div>

                                    {item.value.map((permission, index) => (
                                        <div className="column-item no-bold" key={index}>
                                            {permission.label}
                                        </div>
                                    ))}

                                </Fragment>
                            ))}
                        </div>

                        <div className="column-scrollable">
                            <div className="column-item">
                                { roles.map((r, index) => (
                                    <div className="role-item" key={index}>
                                        {r.label}
                                    </div>
                                ))}
                            </div>

                            { keysToArray(groupBy(permissions, "father")).map((item, index) => (
                                <Fragment key={index}>
                                    <div className="column-item">
                                        { roles.map((r, index) => (
                                            <div className="role-item" key={index}>

                                            </div>
                                        ))}
                                    </div>

                                    {item.value.map((p, index) => (
                                        <div className="column-item no-bold" key={index}>
                                            { roles.map((r, index) => (
                                                <div className="role-item" key={index}>
                                                    <Checkbox
                                                        value={permission[r.value].indexOf(p.value) > -1}
                                                        onChange={(value) => {
                                                            if (value) {
                                                                let _permission = {...permission};
                                                                _permission[r.value] = _permission[r.value].concat(p.value);
                                                                this.setState({permission: _permission});
                                                                permissionInfo.updatePermission(_permission);

                                                            } else {
                                                                let _permission = {...permission};
                                                                _permission[r.value] = _permission[r.value].filter(_p => _p != p.value);
                                                                this.setState({permission: _permission});
                                                                permissionInfo.updatePermission(_permission);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                </Fragment>
                            ))}

                        </div>

                    </div>
                </div>
            </Layout>
        );
    }
}