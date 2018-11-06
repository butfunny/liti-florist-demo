import React from "react";
import {Input} from "../input/input";
import {formatNumber} from "../../common/common";
export class InputNumber extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: formatNumber(props.value)
        }
    }

    componentWillReceiveProps(props) {
      this.setState({value: formatNumber(props.value)})
    }

    render() {

        let {value} = this.state;

        return (
            <Input
                {...this.props}
                value={value}
                onChange={(e) => {
                    let value = e.target.value.replace(/,/g, "");
                    if (!isNaN(value)) {
                        this.setState({value: formatNumber(value)});
                        this.props.onChange(value ? parseInt(value) : "")
                    }
                }}
            />
        );
    }
}