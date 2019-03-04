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

    select() {
        this.input.select();
    }


    render() {
        let {label, className, value, readOnly, icon, error, type, onChange, onKeyDown, info, style, textArea, onFocus, onBlur, topInfo} = this.props;
        let {focus} = this.state;

        const hasValue = () => {
            if (type == "number") return value != null && value != "";
            return value && value.length > 0
        };

        return (
            <div className={classnames("liti-input", className, error && "has-error", hasValue() && "has-value", focus && "focus")} style={style}>

                { textArea ? (
                    <textarea
                        ref={input => this.input = input}
                        onFocus={() => {
                            onFocus && onFocus();
                            this.setState({focus: true})
                        }}
                        onBlur={() => {
                            onBlur && onBlur();
                            this.setState({focus: false});
                        }}
                        value={value || ""}
                        onChange={onChange}
                        readOnly={readOnly}
                        onKeyDown={onKeyDown}
                        style={{height: "80px", resize: "none"}}
                    />
                ) : (
                    <input
                        ref={input => this.input = input}
                        onFocus={() => {
                            onFocus && onFocus();
                            this.setState({focus: true})
                        }}
                        onBlur={() => {
                            onBlur && onBlur();
                            this.setState({focus: false});
                        }}
                        value={value || ""}
                        onChange={onChange}
                        type={type}
                        readOnly={readOnly}
                        onKeyDown={onKeyDown}
                    />
                )}

                { topInfo && (
                    <div className="top-info">
                        {topInfo}
                    </div>
                )}


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

                { hasValue() && (
                    <div className="info">
                        {info}
                    </div>
                )}
            </div>
        );
    }
}