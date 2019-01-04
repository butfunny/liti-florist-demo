import React from "react";
export class LeftSideBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="left-sidebar">
                <div className="logo">
                    <img src="/assets/img/liti-logo.png" alt=""/>
                    <b>Liti Florist</b>
                </div>

                <div className="nav-item-wrapper">
                    <div className="nav-item active">
                        <i className="fa fa-file-text-o nav-icon"/>
                        Hóa Đơn
                    </div>

                    <div className="nav-item">
                        <i className="fa fa-list nav-icon"/>
                        Đơn Hàng
                    </div>

                    <div className="nav-item nav-item-sub">
                        <span className="dot">•</span> Navy Aside
                    </div>


                </div>
            </div>
        );
    }
}