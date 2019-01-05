import React from "react";
import {Layout} from "../../components/layout/layout";
export class SettingRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">
                    <div className="card">
                        <div className="card-title">
                            Màu
                        </div>

                        <div className="card-body">
                            112321
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}