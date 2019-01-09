import React from "react";
import {responsive} from "../../common/responsive/responsive";
import {NavDesktop} from "./desktop/nav-desktop";
import {NavMobile} from "./mobile/nav-mobile";
import classnames from "classnames";
export class Layout extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let isMobile = responsive.le("sm");
        let {children, activeRoute, hidden} = this.props;

        return (
            <div className="app-layout">
                <div className="header">
                    { isMobile ? (
                        <NavMobile
                            activeRoute={activeRoute}
                            routeComp={children}
                            hidden={hidden}
                        />
                    ) : (
                        <NavDesktop
                            activeRoute={activeRoute}
                            routeComp={children}
                            hidden={hidden}
                        />
                    )}
                </div>
            </div>
        );
    }
}