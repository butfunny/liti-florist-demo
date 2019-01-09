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
      this.setState({value: props.value == "" ? "" : formatNumber(props.value)})
    }

    render() {

        let {value} = this.state;
        let {maxVal = 99999999} = this.props;

        return (
            <Input
                {...this.props}
                value={value}
                onChange={(e) => {
                    let value = e.target.value.replace(/,/g, "");
                    if (!isNaN(value)) {
                        if (maxVal) {
                            if (!value || parseInt(value) <= maxVal ) {
                                this.setState({value: formatNumber(value)});
                                this.props.onChange(value ? parseInt(value) : "")
                            }
                        } else {
                            this.setState({value: formatNumber(value)});
                            this.props.onChange(value ? parseInt(value) : "")
                        }
                    }


                }}
            />
        );
    }
}