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
import {NavHeader} from "../desktop/nav-header/nav-header";
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

        let {activeRoute, routeComp, hidden} = this.props;
        const user = userInfo.getUser();
        const _navItems = navItems(user);

        const isHavePermission = _navItems.find(n => {
            if (n.child) {
                return  n.child.find(item => item.label == activeRoute && !item.hide())
            }

            return n.label == activeRoute && !n.hide()
        });


        return (
            <nav className="nav-mobile">
                <NavHeader
                    mobile
                    activeRoute={activeRoute}
                />

                <div className="app-route">
                    { (isHavePermission || !hidden) ? routeComp : (
                        <div className="card">
                            <div className="card-title">
                                Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        );
    }
}