import React from "react";
import classnames from "classnames";
import {permissionInfo, premisesInfo} from "../../../../security/premises-info";
import {ClickOutside} from "../../../click-outside/click-outside";
import {cache} from "../../../../common/cache";
import {userInfo} from "../../../../security/user-info";
import {LeftSideBar, Redirect} from "../../left-sidebar/left-sidebar";
import {modals} from "../../../modal/modals";
import {ChangePasswordModal} from "../../change-password-modal";
import {confirmModal} from "../../../confirm-modal/confirm-modal";
import {security} from "../../../../security/secuiry-fe";
import {RComponent} from "../../../r-component/r-component";

export class NavHeader extends React.Component {

    constructor(props) {
        super(props);
    }

    openSideBar() {

        const modal = modals.openModal({
            content: (
                <LeftSideBar
                    activeRoute={this.props.activeRoute}
                    onClose={() => modal.close()}
                />
            ),
            className: "side-bar-mobile-modal"
        })

    }


    render() {

        let {mobile} = this.props;

        return (
            <div className={classnames("nav-header", mobile && "mobile")}>

                { mobile && (
                    <div className="nav-item-header menu-btn" onClick={() => this.openSideBar()}>
                        <i className="fa fa-bars"/>
                    </div>
                )}

                <PremisesSelect/>
                <UserNav
                    mobile={mobile}
                />
            </div>
        );
    }
}

class PremisesSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    render() {

        const premises = premisesInfo.getPremises();
        const activePremise = premisesInfo.getActivePremise();
        let {open} = this.state;

        return (
            <ClickOutside onClickOut={() => this.setState({open: false})}>
                <div className={classnames("nav-item-header premises", open && "active")}
                     onClick={() => this.setState({open: true})}>
                    {activePremise.name}
                    <i className="fa fa-angle-down"/>

                    {open && (
                        <div className="dropdown-item-wrapper">
                            {premises.filter(p => p._id != activePremise._id).map((premise, index) => (
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


class UserNav extends RComponent {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    render() {

        const user = userInfo.getUser();
        let {open} = this.state;
        let {mobile} = this.props;

        const list = [{
            label: "Đổi Mật Khẩu",
            click: () => {
                const modal = modals.openModal({
                    content: (
                        <ChangePasswordModal
                            onClose={() => modal.close()}
                            onDone={() => {
                                modal.close();
                                confirmModal.alert("Đổi mật khẩu thành công");
                            }}
                        />
                    )
                })
            }
        }, {
            label: "Thoát",
            click: () => {
                security.logout();
            }
        }];


        return (
            <ClickOutside onClickOut={() => this.setState({open: false})}>
                <div className={classnames("nav-item-header user-nav", open && "active")}
                     onClick={() => this.setState({open: true})}>
                    { mobile ? (
                        <i className="fa fa-user-circle-o" aria-hidden="true"/>
                    ) : (
                        <span>
                            {user.username}
                            <i className="fa fa-angle-down"/>
                        </span>
                    )}

                    {open && (
                        <div className="dropdown-item-wrapper">
                            {list.filter(l => !l.hide).map((item, index) => (
                                <Redirect className="dropdown-item" key={index}
                                          navItem={item}
                                          onClick={() => {
                                              setTimeout(() => {
                                                  this.setState({open: false})
                                              })
                                          }}
                                >
                                    {item.label}
                                </Redirect>
                            ))}
                        </div>
                    )}
                </div>
            </ClickOutside>
        )
    }
}