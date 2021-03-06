import React from "react";
import classnames from "classnames";
export class Radio extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {value, onChange, label} = this.props;

        return (
            <div className="checkbox radio">
                <div className={classnames("checkbox-value", value && "checked")}
                     onClick={() => onChange(!value)}
                >
                    {value && <div className="radio-value"/>}
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