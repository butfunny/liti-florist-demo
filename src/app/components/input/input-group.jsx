import React from "react";
import {Input} from "./input";
export class InputGroup extends React.Component {

    constructor(props) {
        super(props);
    }

    focus(){
        this.input.focus()
    }

    render() {

        let {badge} = this.props;

        return (
            <div className="input-group">
                <div className="badge">
                    {badge}
                </div>

                <Input
                    ref={input => this.input = input}
                    {...this.props}
                />
            </div>
        );
    }
}