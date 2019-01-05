import React from "react";
import ReactDOM from "react-dom";
import {ClickOutside} from "../click-outside/click-outside";
export class ButtonGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            left: 0,
            open: false
        }
    }

    componentDidMount() {
        let {left, top} = ReactDOM.findDOMNode(this).getBoundingClientRect();
        this.setState({top, left})
    }

    render() {

        let {top, left, open} = this.state;
        let {actions} = this.props;

        return (
            <div className="button-group" onClick={() => this.setState({open: true})}>
                <div className="button-text">
                    <i className="fa fa-cog nav-icon"/>
                </div>

                { open && (
                    <ClickOutside onClickOut={() => this.setState({open: false})}>
                        <div className="button-dropdown"
                             style={{
                                 top: `${top + 30}px`,
                                 left: `${left - 69}px`
                             }}
                        >
                            { actions.map((action, index) => (
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