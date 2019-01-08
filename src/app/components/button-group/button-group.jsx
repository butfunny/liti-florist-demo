import React from "react";
import ReactDOM from "react-dom";
import {ClickOutside} from "../click-outside/click-outside";
import classnames from "classnames";
import {RComponent} from "../r-component/r-component";
export class ButtonGroup extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            left: 0,
            open: false
        };


    }


    render() {

        let {top, left, open} = this.state;
        let {actions, customText, className} = this.props;

        return (
            <div className={classnames("button-group", className)} onClick={() => this.setState({open: true})}>
                <div className="button-text">
                     {customText ? customText : <i className="fa fa-cog nav-icon"/>}
                </div>

                { open && (
                    <ClickOutside onClickOut={() => this.setState({open: false})}>
                        <div className="button-dropdown"
                        >
                            { actions.filter(a => !a.hide || !a.hide()).map((action, index) => (
                                <div className="button-dropdown-item" key={index}
                                    onClick={() => {
                                        setTimeout(() => {
                                            this.setState({open: false});
                                        });
                                        action.click();
                                    }}
                                >
                                    {action.icon} {action.name}
                                </div>
                            ))}
                        </div>
                    </ClickOutside>
                )}
            </div>
        );
    }
}