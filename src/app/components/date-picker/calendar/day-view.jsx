import React from "react";
import {datePickerUtil} from "../ultil/date-picker-util";
import classnames from "classnames";

export class DayView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {month, year} = this.props.dateView;
        let {value, onSwitchToMonth, onChangeDateView, onChange} = this.props;
        let calendar = datePickerUtil.genCalendar({month, year});

        const isActive = (item) => {
            return item.day == value.day && item.month == value.month && item.year == value.year
        };


        return (
            <div className="datepicker-days">
                <table className="table-condensed">
                    <thead>
                    <tr>
                        <th className="prev" onClick={() => {
                            const updatedDay = datePickerUtil.subtractMonth({day: 1, month, year});
                            onChangeDateView({month: updatedDay.month, year: updatedDay.year});
                        }}>
                            «
                        </th>
                        <th colSpan="5" className="datepicker-switch" onClick={() => onSwitchToMonth()}>Tháng {month} {year}</th>
                        <th className="next"
                            onClick={() => {
                                const updatedDay = datePickerUtil.plusMonth({day: 1, month, year});
                                onChangeDateView({month: updatedDay.month, year: updatedDay.year});
                            }}
                        >
                            »
                        </th>
                    </tr>
                    <tr>
                        <th className="dow">CN</th>
                        <th className="dow">T2</th>
                        <th className="dow">T3</th>
                        <th className="dow">T4</th>
                        <th className="dow">T5</th>
                        <th className="dow">T6</th>
                        <th className="dow">T7</th>
                    </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5, 6].map((key, index) => (
                            <tr key={index}>
                                { calendar.slice(index * 7, (index * 7 + 7)).map((item, index) => (
                                    <td
                                        onClick={() => onChange(item)}
                                        className={classnames("day", item.oldDay && "old", isActive(item) && "active")}
                                        key={index}>
                                        {item.day}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}