import React, {Fragment} from "react";
import {SwatchesPicker} from "react-color";
import classnames from "classnames";
import {ClickOutside} from "../click-outside/click-outside";
export class SelectColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        }
    }

    render() {

        let {value, onChange, className, error, label} = this.props;
        let {open} = this.state;

        return (
            <div className={classnames("liti-input select-color select", className, error && "has-error", value && "has-value", open && "focus")}>
                <div className="select-text" onClick={() => this.setState({open: true})}>
                    { value && (
                        <div className="color" style={{background: value}}/>
                    )}

                    <i className={classnames("fa sort-icon", !open ? "fa-angle-down" : "fa-angle-up")}/>
                </div>

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

                { open && (
                    <ClickOutside onClickOut={() => this.setState({open: false})}>
                        <div className="picker-dropdown-wrapper">
                            <SwatchesPicker
                                color={value}
                                onChange={(color) => {
                                    onChange(color.hex, () => {
                                        this.setState({open: false})
                                    })
                                }}
                            />
                        </div>
                    </ClickOutside>
                )}
            </div>
        );
    }
}