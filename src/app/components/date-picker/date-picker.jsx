import React from "react";
import {Calendar} from "./calendar/calendar";
import {ClickOutside} from "../click-outside/click-outside";
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

        const formatValue = (value) => {
            if (value < 10) return `0${value}`;
            return value
        };

        return (
            <ClickOutside onClickOut={() => this.setState({open :false})}>
                <div className="date-picker">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text"><i className="ni ni-calendar-grid-58"/></span>
                        </div>
                        <input className="form-control"
                               type="text"
                               value={`${formatValue(value.day)}/${formatValue(value.month)}/${value.year}`}
                               readOnly
                               onClick={() => this.setState({open: true})}
                        />
                    </div>

                    { open && (
                        <Calendar
                            value={value}
                            onChange={(value) => this.handleChange(value)}
                        />
                    )}


                </div>
            </ClickOutside>
        );
    }
}