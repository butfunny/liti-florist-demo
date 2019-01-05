import React, {Fragment} from "react";
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
import {RComponent} from "../../r-component/r-component";
import {LeftSideBar} from "../left-sidebar/left-sidebar";
import {NavHeader} from "./nav-header/nav-header";
import {navItems} from "../nav-items";
import {userInfo} from "../../../security/user-info";

export class NavDesktop extends RComponent {

    constructor(props) {
        super(props);

        premisesInfo.onChange(() => {
            this.safeUpdate();
        })
    }

    render() {
        let {activeRoute, routeComp} = this.props;
        const user = userInfo.getUser();

        const _navItems = navItems(user);

        const isHavePermission = (activeRoute == "Doanh Thu" && ["florist", "sale", "ship"].indexOf(user.role) > -1) ? true : _navItems.find(n => {
            if (n.child) {
                return  n.child.find(item => item.label == activeRoute && !item.hide())
            }

            return n.label == activeRoute && !n.hide()
        });


        return (
            <nav className="nav-desktop">
                <NavHeader/>
                <LeftSideBar
                    activeRoute={activeRoute}
                />

                <div className="app-route">

                    { isHavePermission ? routeComp : (
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

