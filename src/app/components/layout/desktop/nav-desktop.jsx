import React, {Fragment} from "react";
import {Link} from "react-router-dom";
import {Dropdown} from "../../dropdown/dropdown";
import {premisesInfo} from "../../../security/premises-info";
import {cache} from "../../../common/cache";
import {userInfo} from "../../../security/user-info";
import {RComponent} from "../../r-component/r-component";
import classnames from "classnames";
import {navItems} from "../nav-items.jsx";
export class NavDesktop extends RComponent {

    constructor(props) {
        super(props);

        premisesInfo.onChange(() => {
            this.safeUpdate();
        })
    }

    render() {

        let premises = premisesInfo.getPremises() || [];
        let user = userInfo.getUser();
        let {activeRoute} = this.props;

        const getCurrentPremise = () => {
            const activeID = cache.get("active-premises");
            if (!activeID) {
                cache.set(premises[0]._id, "active-premises");
                return premises[0].name;
            }
            const found = premises.find(p => p._id == activeID);
            if (found) return found.name;
            else {
                cache.set(premises[0]._id, "active-premises");
                return premises[0].name
            }
        };

        const activeID = cache.get("active-premises") || premises[0]._id;



        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary nav-desktop">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <img src="/assets/img/liti-logo.png" alt=""/>
                        <sup>{getCurrentPremise()}</sup>
                    </Link>
                    <ul className="navbar-nav ml-lg-auto">
                        { navItems(premises.filter(p => p._id != activeID), user).filter(n =>  (n.hide ? !n.hide() : true) &&  (n.child ? n.child.filter(c => !c.hide || !c.hide()).length > 0 : true)).map((navItem, index) => (
                            <li className="nav-item" key={index}>

                                { navItem.child ? (
                                    <Dropdown
                                        renderContent={
                                            navItem.child.filter(c => !c.hide || !c.hide()).map((child, index) => (
                                                <Redirect
                                                    onClick={() => {}}
                                                    className="dropdown-item" key={index} navItem={child} />
                                            ))
                                        }
                                    >
                                        <Redirect
                                            onClick={() => {}}
                                            className={classnames("nav-link", activeRoute == navItem.label && "active")} navItem={navItem} />

                                    </Dropdown>
                                ) : (
                                    <Redirect
                                        onClick={() => {}}
                                        className={classnames("nav-link", activeRoute == navItem.label && "active")} navItem={navItem} />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        );
    }
}

export const Redirect = ({navItem, className, onClick}) => {
    if (navItem.to) return <Link onClick={onClick} className={className} to={navItem.to}>{navItem.label}</Link>;
    return <a className={className} onClick={() => {navItem.click && navItem.click(); onClick()}}>{navItem.label}</a>
};