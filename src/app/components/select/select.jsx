import React from "react";
import ReactDOM from "react-dom";
import {ClickOutside} from "../click-outside/click-outside";
import classnames from "classnames";
export class Select extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            left: 0,
            open: false,
            width: 0
        }
    }

    componentDidMount() {
        let {left, top, width} = ReactDOM.findDOMNode(this).getBoundingClientRect();
        this.setState({top, left, width})
    }

    render() {

        let {value, onChange, displayAs, list, label, error, className} = this.props;
        let {open, top, left, width} = this.state;

        return (
            <div className={classnames("liti-input select", className, error && "has-error", value && "has-value", open && "focus")} onClick={() => this.setState({open: true})}>
                { value && (
                    <div className="select-text">
                        {displayAs ? displayAs(value) : value}

                        <i className={classnames("fa sort-icon", !open ? "fa-angle-down" : "fa-angle-up")}/>
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

                { open && (
                    <ClickOutside onClickOut={() => this.setState({open: false})}>
                        <div className="select-dropdown"
                        >
                            { list.map((item, index) => (
                                <div className={classnames("dropdown-item", item == value && "active")} key={index}
                                     onClick={() => {
                                         setTimeout(() => {
                                             this.setState({open: false});
                                         });
                                         onChange(item)
                                     }}
                                >
                                    {displayAs ? displayAs(item) : item}
                                </div>
                            ))}
                        </div>
                    </ClickOutside>
                )}


            </div>
        );
    }
}