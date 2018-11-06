import React from "react";
import classnames from "classnames";
import {datePickerUtil} from "../ultil/date-picker-util";
export class MonthView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {value, onChange, onSwitchToDay} = this.props;
        return (
            <div className="datepicker-months">
                <table className="table-condensed">
                    <thead>
                    <tr>
                        <th className="prev" onClick={() => {
                            onChange({month: value.month, year: value.year - 1});
                        }}>«</th>
                        <th colSpan="5" className="datepicker-switch">{value.year}</th>
                        <th className="next"
                            onClick={() => {
                                onChange({month: value.month, year: value.year + 1});
                            }}
                        >»</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td colSpan="7">
                            { [1,2,3,4,5,6,7,8,9,10,11,12].map((month, index) => (
                                <span
                                    onClick={() => {
                                        onChange({month: month, year: value.year});
                                        onSwitchToDay();
                                    }}
                                    className={classnames("month", value.month == month && "active focused")} key={index}
                                >Th {month}</span>
                            ))}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}