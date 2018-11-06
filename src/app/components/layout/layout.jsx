import React from "react";
import {responsive} from "../../common/responsive/responsive";
import {NavDesktop} from "./desktop/nav-desktop";
import {NavMobile} from "./mobile/nav-mobile";
export class Layout extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let isMobile = responsive.le("sm");
        let {children, activeRoute} = this.props;

        return (
            <div className="app-layout">
                <div className="header">
                    { isMobile ? (
                        <NavMobile
                            activeRoute={activeRoute}
                        />
                    ) : (
                        <NavDesktop
                            activeRoute={activeRoute}
                        />
                    )}
                </div>

                <div className="container">
                    {children}
                </div>
            </div>
        );
    }
}