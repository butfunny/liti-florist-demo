import React, {Fragment} from "react";
import classnames from "classnames";
import {premisesInfo} from "../../../security/premises-info";
import {userInfo} from "../../../security/user-info";
import {navItems} from "../nav-items";
import {Dropdown} from "../../dropdown/dropdown";
import {Link} from "react-router-dom";
let navCache = {};

export class LeftSideBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let user = userInfo.getUser();
        let {activeRoute} = this.props;

        return (
            <div className="left-sidebar">
                <div className="logo">
                    <img src="/assets/img/liti-logo.png" alt=""/>
                    <b>Liti Florist</b>
                </div>

                <div className="nav-item-wrapper">
                    {navItems(user).filter(n => (n.hide ? !n.hide() : true) && (n.child ? n.child.filter(c => !c.hide || !c.hide()).length > 0 : true)).map((navItem, index) => {
                        if (navItem.child) return (
                            <NavItemGroup
                                activeRoute={activeRoute}
                                key={index}
                                navItem={navItem}
                            />
                        );

                        return (
                            <Redirect className={classnames("nav-item", activeRoute == navItem.label && "active")}
                                      navItem={navItem}
                                      key={index}
                            >
                                {navItem.icon}
                                {navItem.label}
                            </Redirect>
                        );
                    })}


                </div>
            </div>
        );
    }
}


class NavItemGroup extends React.Component {

    constructor(props) {
        super(props);

        const getDefaultOpen = () => {
            if (navCache[props.navItem.label]) return navCache[props.navItem.label];
            return props.navItem.child.map(c => c.label).indexOf(props.activeRoute) > -1
        };

        this.state = {
            open: getDefaultOpen()
        };

        navCache[props.navItem.label] = getDefaultOpen();

    }


    render() {
        let {open} = this.state;
        let {navItem, activeRoute} = this.props;


        return (
            <Fragment>
                <div className={classnames("nav-item", navItem.child.map(c => c.label).indexOf(activeRoute) > -1 && "active")}
                     onClick={() => {
                         this.setState({open: !open});
                         navCache[navItem.label] = !open;
                     }}>
                        {navItem.icon}
                        {navItem.label}

                    <i className={classnames("fa fa-angle-right arrow-icon", open && "open")}/>
                </div>

                <div className="nav-item-sub-wrapper" style={{
                    height: open ? `${38 * navItem.child.filter(c => !c.hide || !c.hide()).length}px` : 0,
                }}>
                    {navItem.child.filter(c => !c.hide || !c.hide()).map((child, index) => (
                        <Redirect key={index} navItem={child} className={classnames("nav-item nav-item-sub", activeRoute == child.label && "active")}>
                            <span className="dot">•</span> {child.label}
                        </Redirect>
                    ))}
                </div>


            </Fragment>
        )
    }
}

export const Redirect = ({navItem, className, onClick, children}) => {
    if (navItem.to) return <Link onClick={onClick} className={className} to={navItem.to}>{children}</Link>;
    return <a className={className} onClick={() => {
        navItem.click && navItem.click();
        onClick()
    }}>{children}</a>
};

