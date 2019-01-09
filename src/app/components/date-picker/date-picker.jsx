import React from "react";
import {Calendar} from "./calendar/calendar";
import {ClickOutside} from "../click-outside/click-outside";
import classnames from "classnames";
export class DatePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.parseDate(props.value),
            open: false
        }
    }

    componentWillReceiveProps(props) {
      this.setState({value: this.parseDate(props.value)})
    }

    parseDate(date) {
        return {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        }
    }

    handleChange(newDate) {
        this.setState({value: newDate, open: false});
        let {value, onChange} = this.props;
        const updatedDate = new Date(value);
        updatedDate.setDate(newDate.day);
        updatedDate.setMonth(newDate.month - 1);
        updatedDate.setFullYear(newDate.year);
        onChange(updatedDate);
    }

    render() {

        let {value, open} = this.state;
        let {label, className} = this.props;

        const formatValue = (value) => {
            if (value < 10) return `0${value}`;
            return value
        };


        return (
            <ClickOutside onClickOut={() => this.setState({open :false})}>
                <div className={classnames("date-picker liti-input select has-value", className)} onClick={() => this.setState({open: true})}>

                    <div className="select-text">
                        {formatValue(value.day)}/{formatValue(value.month)}/{value.year}
                    </div>

                    <div className="calender-button">
                        <i className="fa fa-calendar" aria-hidden="true"/>
                    </div>

                    <div className="label"

                    >
                        {label}
                    </div>

                    <div className="bar">
                        {label}
                    </div>

                    { open && (
                        <Calendar
                            value={value}
                            onChange={(value) => {
                                setTimeout(() => this.handleChange(value))
                            }}
                        />
                    )}


                </div>
            </ClickOutside>
        );
    }
}