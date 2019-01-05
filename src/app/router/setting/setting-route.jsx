import React from "react";
import {Layout} from "../../components/layout/layout";
import {DataTable} from "../../components/data-table/data-table";
import {SelectColor} from "../../components/select-color/select-color";
import {ColorSetting} from "./color-setting";

export class SettingRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: undefined
        }
    }

    render() {
        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">
                    <ColorSetting />
                </div>
            </Layout>
        );
    }
}