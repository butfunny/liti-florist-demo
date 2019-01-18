import React from "react";
import {Layout} from "../../../components/layout/layout";
import {getStartAndLastDayOfWeek} from "../../../common/common";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {Select} from "../../../components/select/select";
export class ReportSupplier extends React.Component {

    constructor(props) {
        super(props);
        let {from, to} = getStartAndLastDayOfWeek();

        this.state = {
            from,
            to,
            loading: true,
            requests: []
        };
    }

    render() {

        let {loading, from, to, bills, viewType, types, colors, sales, florists, ships, customers} = this.state;

        return (
            <Layout activeRoute="Nhà Cung Cấp">
                <div className="card bill-report-route">
                    <div className="card-title">
                        Báo cáo nhà cung cấp

                    </div>

                    <div className="card-body">
                        <div className="row first-margin"
                        >
                            <DatePicker
                                className="col"
                                label="Từ Ngày"
                                value={from}
                                onChange={(from) => {
                                    this.setState({from})
                                }}
                            />

                            <DatePicker
                                className="col"
                                label="Tới Ngày"
                                value={to}
                                onChange={(to) => {
                                    this.setState({to})
                                }}
                            />

                            <button className="btn btn-primary"
                                    onClick={() => this.getReport()}
                                    disabled={loading}
                            >
                                <span className="btn-text">Xem</span>
                                {loading &&
                                <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>


                    </div>


                </div>
            </Layout>
        );
    }
}