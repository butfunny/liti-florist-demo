import React from "react";
export class TimePicker extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {value = new Date(), onChange} = this.props;

        return (
            <div className="time-picker">
                <InputPicker
                    value={value.getHours()}
                    onChange={(hour) => {
                        let newDate = new Date(value);
                        newDate.setHours(hour);
                        onChange(newDate);
                    }}
                    maxVal={23}
                    minVal={0}
                />

                :

                <InputPicker
                    value={value.getMinutes()}
                    onChange={(minute) => {
                        let newDate = new Date(value);
                        newDate.setMinutes(minute);
                        onChange(newDate);
                    }}
                    maxVal={59}
                    minVal={0}
                />
            </div>
        );
    }
}

class InputPicker extends React.Component {

    handleChange(value) {
        let {maxVal, minVal, onChange} = this.props;
        if (!isNaN(value)) {
            let valueInt = parseInt(value);
            if (valueInt > maxVal) onChange(maxVal);
            else if (valueInt < minVal) onChange(minVal);
            else onChange(valueInt)
        }

        if (value.length == "") onChange(minVal);

    }

    render() {
        let {value} = this.props;

        const formatValue = (value) => {
            if (value < 10) return `0${value}`;
            return value
        };

        return (
            <div className="input-picker">
                <input
                    className="form-control"
                    value={formatValue(value)}
                    onChange={(e) => this.handleChange(e.target.value)}
                    ref={input => this.input = input}
                    onClick={() => this.input.select()}
                />
            </div>
        )
    }
}