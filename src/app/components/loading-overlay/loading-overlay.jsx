import React from "react";
import ReactDOM from "react-dom";
import {RComponent} from "../r-component/r-component";

export class LoadingOverlay extends RComponent {
    hideF = false;

    constructor(props) {
        super(props);
    }


    componentWillReceiveProps({show}) {
      setTimeout(() => {
          let domNode = ReactDOM.findDOMNode(this);
          if (domNode == null) {
              return;
          }

          if (show) {
              this.hideF = this.showOverlay(domNode);
          } else if (this.hideF) {
              this.hideF();
              this.hideF = null;
          }
      })
    }

    showOverlay(domNode) {
        let $target = $(domNode);
        let offset = $target.offset();
        let width = $target.width();
        let height = $target.height();


        let $overlay = $("<div class='loading-overlay'/>");
        $overlay.append(`<i class="fa fa-spinner fa-pulse"/>`);
        $("body").append($overlay);

        $overlay.css({
            top: offset.top,
            left: offset.left,
            width,
            height,
        });

        return () => {
            $overlay.remove();
        };
    }

    render() {
        return (
            React.Children.only(this.props.children)
        );
    }
}
