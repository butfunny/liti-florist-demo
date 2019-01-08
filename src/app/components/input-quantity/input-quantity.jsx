import React from "react";
import {InputNumber} from "../input-number/input-number";
import {Input} from "../input/input";
export class InputQuantity extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {value, onChange} = this.props;

        return (
            <div className="input-quantity">
                <button className="btn btn-danger btn-small"
                    onClick={() => onChange(value - 1)}
                >
                    <i className="fa fa-minus" aria-hidden="true"/>
                </button>

                <Input
                    readOnly
                    value={value}
                />

                <button className="btn btn-primary btn-small"
                    onClick={() => onChange(value + 1)}
                >
                    <i className="fa fa-plus" aria-hidden="true"/>
                </button>
            </div>
        );
    }
}