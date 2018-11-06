import React from "react";
import classnames from "classnames";
export class Input extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            focus: false
        }
    }

    blur() {
        this.input.blur();
    }

    render() {
        let {className, value, onChange, placeholder, type, error, disabled, autoSelect, onKeyDown, onFocus, onBlur, label} = this.props;
        let {focus} = this.state;

        return (

            <div className={classnames("form-group input", className, focus && "focused")}>
                {label && (
                    <label className="control-label">
                        {label}
                    </label>
                )}

                <input
                    ref={input => this.input = input}
                    value={value === undefined ? "" : value}
                    className={classnames("form-control", error && "is-invalid")}
                    placeholder={placeholder}
                    onChange={onChange}
                    onFocus={() => {this.setState({focus: true}); onFocus && onFocus()}}
                    onBlur={() => {this.setState({focus: false}); onBlur && onBlur()}}
                    type={type}
                    disabled={disabled}
                    onClick={() => {
                        autoSelect && this.input.select();
                    }}
                    onKeyDown={onKeyDown}
                />

                <div className="error-text">
                    {error}
                </div>
            </div>
        );
    }
}