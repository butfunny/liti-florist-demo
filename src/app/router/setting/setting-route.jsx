import React from "react";
import {Layout} from "../../components/layout/layout";
import {ColorSetting} from "./color-setting";
import {TypeSetting} from "./type-setting";
import {permissionInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {security} from "../../security/secuiry-fe";

export class SettingRoute extends React.Component {

    render() {

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