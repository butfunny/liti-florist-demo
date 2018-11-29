import React from "react";
import {Layout} from "../../../components/layout/layout";
export class ReportBillRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Layout activeRoute="Báo Cáo">
                <div className="report-route bill-report-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Báo cáo đơn hàng</h1>
                    </div>
                </div>
            </Layout>
        );
    }
}