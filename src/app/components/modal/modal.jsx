import React from "react";
import classnames from "classnames";
import {responsive} from "../../common/responsive/responsive";
export class Modal extends React.Component {
    overlayElem = null;

    lastScrollTop;

    constructor(props) {
        super(props);
        this.state = {};

        this.lastScrollTop = $(window).scrollTop();


        if (responsive.le("xs")) {
            $("html").css({"overflow": "hidden", "position" : "relative", "height" : "100%"})
        } else {
            $("html").css({"overflow": "hidden"})
        }

    };

    componentWillUnmount() {
        if (responsive.le("xs")) {
            $("html").css({"overflow": "", "position" : "", "height" : ""});
            window.scroll(0, this.lastScrollTop);
        } else {
            $("html").css({"overflow": ""})
        }

    }


    render() {
        const {className, onDismiss, content, cantKickOut} = this.props;

        return (
            <div className={className}>
                <div className="app-modal">
                    <div
                        className="app-modal-overlay"
                        onMouseDown={(e) => e.target == this.overlayElem && !cantKickOut && onDismiss()}
                        onTouchStart={(e) => e.target == this.overlayElem && !cantKickOut && onDismiss()}
                        ref={(elem) => this.overlayElem = elem}
                    >
                        { content }
                    </div>
                </div>
            </div>
        );
    }
}