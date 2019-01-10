import React, {Fragment} from "react";
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

    handleChange(e, action) {
        console.log(1123);
    }


    render() {

        let {top, left, open} = this.state;
        let {actions, customText, className, onUpload} = this.props;

        return (
            <div className={classnames("button-group", className)} onClick={() => this.setState({open: true})}>
                <div className="button-text">
                    {customText ? customText : <i className="fa fa-cog nav-icon"/>}
                </div>


                {open && (
                    <ClickOutside onClickOut={() => this.setState({open: false})}>
                        <div className="button-dropdown"
                        >
                            {actions.filter(a => !a.hide || !a.hide()).map((action, index) => (
                                <Fragment key={index}>
                                    {action.type == "upload" ? (
                                        <UploadInput
                                            action={action}
                                            onChange={(e) => {
                                                setTimeout(() => {
                                                    this.setState({open: false});
                                                });
                                                action.onUpload(e);
                                            }}
                                        />
                                    ) : (
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
                                    )}


                                </Fragment>
                            ))}
                        </div>
                    </ClickOutside>
                )}
            </div>
        );
    }
}


export class UploadInput extends React.Component {

    render() {

        let {onChange, action} = this.props;

        return (
            <div className="button-dropdown-item"
                 onClick={() => this.inputUpload.click()}
            >
                <input className="input-upload"
                       ref={elem => this.inputUpload = elem}
                       type="file"
                       accept="image/png, image/jpeg"
                       onChange={(e) => onChange(e)}
                />

                {action.icon} {action.name}
            </div>
        )
    }
}