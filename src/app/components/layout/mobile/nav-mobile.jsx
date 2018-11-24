import React, {Fragment} from "react";
import {Link} from "react-router-dom";
import classnames from "classnames";
import {ClickOutside} from "../../click-outside/click-outside";
import {Dropdown} from "../../dropdown/dropdown";
import {navItems} from "../nav-items.jsx";
import {Redirect} from "../desktop/nav-desktop";
import {premisesInfo} from "../../../security/premises-info";
import {cache} from "../../../common/cache";
import {userInfo} from "../../../security/user-info";
import {RComponent} from "../../r-component/r-component";
export class NavMobile extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        };

        premisesInfo.onChange(() => {
            this.safeUpdate();
        })
    }

    render() {

        let {show} = this.state;
        let {activeRoute} = this.props;

        let premises = premisesInfo.getPremises();
        let user = userInfo.getUser();


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
            <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-info nav-mobile">
                <div className="container">
                    <a className="navbar-brand" href="#"><img src="/assets/img/liti-logo.png" alt=""/> <sup>{getCurrentPremise()}</sup></a>
                    <button className="navbar-toggler" onClick={() => this.setState({show: true})}>
                        <span className="navbar-toggler-icon"/>
                    </button>
                    <div className={classnames("collapse navbar-collapse", show && "show")}>
                        <div className="navbar-collapse-header">
                            <div className="row">
                                <div className="col-10 collapse-brand">
                                    <Link to="/">
                                        <img src="/assets/img/liti-logo.png" alt=""/>
                                        <sup>{getCurrentPremise()}</sup>
                                    </Link>
                                </div>
                                <div className="col-2 collapse-close">
                                    <button className="navbar-toggler" onClick={() => this.setState({show: false})}>
                                        <span/>
                                        <span/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <ul className="navbar-nav ml-lg-auto">

                            { navItems(premises.filter(p => p._id != activeID), user).filter(n =>  (n.hide ? !n.hide() : true) &&  (n.child ? n.child.filter(c => !c.hide || !c.hide()).length > 0 : true)).map((navItem, index) => (
                                <li className="nav-item" key={index}>

                                    { navItem.child ? (
                                        <Dropdown
                                            noClickOut
                                            renderContent={
                                                navItem.child.filter(c => !c.hide || !c.hide()).map((child, index) => (
                                                    <Redirect
                                                        onClick={() => this.setState({show: false})}
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
                                            onClick={() => this.setState({show: false})}
                                            className={classnames("nav-link", activeRoute == navItem.label && "active")} navItem={navItem} />
                                    )}
                                </li>
                            ))}
                        </ul>

                    </div>
                </div>
            </nav>
        );
    }
}