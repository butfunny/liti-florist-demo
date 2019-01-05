import React from "react";
import classnames from "classnames";

export class Input extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            focus: false
        }
    }

    focus() {
        this.input.focus();
    }


    render() {
        let {label, className, value, readOnly, icon, error, type, onChange, onKeyDown} = this.props;
        let {focus} = this.state;

        const hasValue = () => {
            if (type == "number") return value != null || value != "";
            return value && value.length > 0
        };


        return (
            <div className={classnames("liti-input", className, error && "has-error", hasValue() && "has-value", focus && "focus")}>
                <input
                    ref={input => this.input = input}
                    onFocus={() => this.setState({focus: true})}
                    onBlur={() => this.setState({focus: false})}
                    value={value || ""}
                    onChange={onChange}
                    type={type}
                    readOnly={readOnly}
                    onKeyDown={onKeyDown}
                />


                <div className="label"

                >
                    {label}
                </div>

                <div className="error">
                    {error}
                </div>

                <div className="bar">
                    {label}
                </div>
            </div>
        );
    }
}