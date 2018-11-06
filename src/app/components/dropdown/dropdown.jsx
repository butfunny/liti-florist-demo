import React from "react";
import classnames from "classnames";
import {ClickOutside} from "../click-outside/click-outside";
import {RComponent} from "../r-component/r-component";
export class Dropdown extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            open: !!props.noClickOut
        }
    }

    render() {
        let {children, className, renderContent, noClickOut} = this.props;
        let {open} = this.state;

        return (
            <ClickOutside onClickOut={() => !noClickOut && this.setState({open: false})}>
                <div className={classnames("dropdown", className, open && "show")} onClick={() => {
                    this.setState({open: true})
                }}>
                    {children}

                    <div className={classnames("dropdown-menu dropdown-menu-center", open && "show")} onClick={() => {
                        setTimeout(() => {
                            !noClickOut && this.setState({open: false})
                        })
                    }}>
                        {renderContent}
                    </div>
                </div>
            </ClickOutside>
        );
    }
}