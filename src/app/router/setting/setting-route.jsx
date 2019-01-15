import React from "react";
import {Layout} from "../../components/layout/layout";
import {ColorSetting} from "./color-setting";
import {TypeSetting} from "./type-setting";
import {permissionInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {security} from "../../security/secuiry-fe";
import {customerApi} from "../../api/customer-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {warehouseApi} from "../../api/warehouse-api";

export class SettingRoute extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            customers: null,
            doneIndex: 0
        }

        customerApi.getCustomersAll().then((customers) => {
            this.setState({customers})
        })
    };


    render() {

        let {customers, doneIndex} = this.state;
        const user = userInfo.getUser();

        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">

                    {security.isHavePermission(["bill.editProductColor"]) && (
                        <ColorSetting />
                    )}

                    { security.isHavePermission(["bill.editProductType"]) && (
                        <TypeSetting/>
                    )}

                </div>
            </Layout>
        );
    }
}