import React from "react";
import {DayView} from "./day-view";
import {MonthView} from "./month-view";
import classnames from "classnames";

export class Calendar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            view: "day",
            dateView: props.value
        }
    }

    render() {

        let {value, onChange} = this.props;
        let {view, dateView} = this.state;

        return (
            <div className={classnames("datepicker datepicker-dropdown dropdown-menu", view)}>
                { view == "day" ? (
                    <DayView
                        dateView={dateView}
                        onChangeDateView={(dateView) => this.setState({dateView})}
                        value={value}
                        onChange={(value) => onChange(value)}
                        onSwitchToMonth={() => this.setState({view: "moth"})}
                    />
                ) : (
                    <MonthView
                        value={dateView}
                        onChange={(dateView) => this.setState({dateView})}
                        onSwitchToDay={() => this.setState({view: "day"})}
                    />
                )}
            </div>
        );
    }
}