import React from "react";
import classnames from "classnames";
import {permissionInfo, premisesInfo} from "../../../../security/premises-info";
import {ClickOutside} from "../../../click-outside/click-outside";
import {cache} from "../../../../common/cache";
export class NavHeader extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="nav-header">
                <PremisesSelect />
            </div>
        );
    }
}

class PremisesSelect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            open :false
        };
    }

    render() {

        const premises = premisesInfo.getPremises();
        const activePremise = premisesInfo.getActivePremise();
        let {open} = this.state;

        return (
            <ClickOutside onClickOut={() => this.setState({open: false})}>
                <div className={classnames("nav-item-header premises", open && "active")} onClick={() => this.setState({open :true})}>
                    {activePremise.name}
                    <i className="fa fa-angle-down"/>

                    { open && (
                        <div className="dropdown-item-wrapper">
                            { premises.filter(p => p._id != activePremise._id).map((premise, index) => (
                                <div className="dropdown-item" key={index}
                                    onClick={() => {
                                        cache.set(premise._id, "active-premises");
                                        premisesInfo.forceUpdate();
                                        setTimeout(() => {
                                            this.setState({open: false})
                                        })
                                    }}
                                >
                                    Sang {premise.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ClickOutside>
        )
    }
}