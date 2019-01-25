import React from "react";
import {Select} from "../../components/select/select";
import {DatePicker} from "../../components/date-picker/date-picker";
export class RequestWarehouseFilter extends React.Component {

    constructor(props) {
        super(props);

        let from = new Date();
        from.setHours(0, 0,0 ,0);

        let to = new Date();
        to.setHours(23, 59, 59, 99);

        this.state = {
            from: from,
            to: to,
            filterType: "Toàn Bộ"
        }
    }


    render() {

        let {filterType, from, to} = this.state;
        let {onChange, loading} = this.props;

        return (
            <div className="bill-report-route">
                <Select
                    className="first-margin"
                    label="Lọc Theo"
                    value={filterType}
                    list={["Toàn Bộ", "Chọn Ngày"]}
                    onChange={(filterType) => this.setState({filterType}, () => {
                        if (filterType == "Toàn Bộ") onChange({from: null, to: null})
                    })}
                />

                { filterType == "Chọn Ngày" && (
                    <div className="row"
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
                                onClick={() => onChange({from, to})}
                                disabled={loading}
                        >
                            <span className="btn-text">Xem</span>
                            {loading &&
                            <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                        </button>
                    </div>
                )}
            </div>
        );
    }
}