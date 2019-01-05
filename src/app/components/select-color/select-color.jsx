import React, {Fragment} from "react";
import {CompactPicker} from "react-color";
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
            <ClickOutside
                onClickOut={() => this.setState({open: false})}>

                <div className={classnames("liti-input select-color", className, error && "has-error", value && "has-value", open && "focus")}>
                    <div className="select-text" onClick={() => this.setState({open: true})}>
                        { value && (
                            <div className="color" style={{background: value}}/>
                        )}
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
                        <div className="picker-dropdown-wrapper">
                            <CompactPicker
                                color={value}
                                onChange={(color) => {
                                    onChange(color.hex)
                                }}
                            />
                        </div>
                    )}
                </div>
            </ClickOutside>
        );
    }
}