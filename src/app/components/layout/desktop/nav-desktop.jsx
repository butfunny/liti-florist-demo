import React, {Fragment} from "react";
import {premisesInfo} from "../../../security/premises-info";
import {RComponent} from "../../r-component/r-component";
import {LeftSideBar} from "../left-sidebar/left-sidebar";

export class NavDesktop extends RComponent {

    constructor(props) {
        super(props);

        premisesInfo.onChange(() => {
            this.safeUpdate();
        })
    }

    render() {
        let {activeRoute} = this.props;

        return (
            <nav className="nav-desktop">

                <LeftSideBar
                    activeRoute={activeRoute}
                />
            </nav>
        );
    }
}

