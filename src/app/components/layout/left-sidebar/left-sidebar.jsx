import React, {Fragment} from "react";
import classnames from "classnames";
import {premisesInfo} from "../../../security/premises-info";
import {userInfo} from "../../../security/user-info";
import {navItems} from "../nav-items";
import {Dropdown} from "../../dropdown/dropdown";
import {Link} from "react-router-dom";

export class LeftSideBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let user = userInfo.getUser();

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
                          key={index}
                          navItem={navItem}
                        />
                      );

                      return (
                        <Redirect className="nav-item"
                                  navItem={navItem}
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
        this.state = {
            open: false
        }
    }

    render() {
        let {open} = this.state;
        let {navItem} = this.props;

        return (
          <Fragment>
              <div className="nav-item" onClick={() => this.setState({open: !open})}>
                  {navItem.icon}
                  {navItem.label}

                  <i className={classnames("fa fa-angle-right arrow-icon", open && "open")}/>
              </div>

              <div className="nav-item-sub-wrapper" style={{
                  height: open ? `${38 * navItem.child.filter(c => !c.hide || !c.hide()).length}px` : 0
              }}>
                  {navItem.child.filter(c => !c.hide || !c.hide()).map((child, index) => (
                    <Redirect key={index} navItem={child} className="nav-item nav-item-sub">
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

