import React from "react";
import classnames from "classnames";
export class Checkbox extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {value, onChange, label} = this.props;

        return (
            <div className="checkbox">
                <div className={classnames("checkbox-value", value && "checked")}
                    onClick={() => onChange(!value)}
                >
                    <i className="fa fa-check"/>
                </div>

                <label className="checkbox-label"
                       onClick={() => onChange(!value)}
                >
                    <span>{label}</span>
                </label>
            </div>
        );
    }
}