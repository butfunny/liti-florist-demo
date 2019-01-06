import React from "react";
import classnames from "classnames";

export class Pagination extends React.Component {
    getShownPages() {

        let total = this.props.total;
        let r = {
            from: Math.floor((this.props.value - 1) / 10) * 10 + 1,
            to  : Math.min(total, Math.floor((this.props.value - 1) / 10) * 10 + 10)
        };
        if (this.props.value != 1 && this.props.value == r.from) {
            r.from--;
            r.to--;
        } else if (this.props.value != total && this.props.value == r.to) {
            r.from++;
            r.to++;
        }

        let shownPages = [];

        if (r.from > 1) {
            shownPages.push({
                page: 1,
                label: "1"
            });
        }
        for (var p = r.from; p <= r.to; p++) {
            shownPages.push({
                page: p,
                label: (p == r.from && r.from > 2) || (p == r.to && r.to < total - 1) ? "..." : p
            });
        }
        if (r.to < total) {
            shownPages.push({
                page: total,
                label: total
            });
        }
        return shownPages;
    }

    render() {
        let shownPages = this.getShownPages();

        return (
            <div className="pagination">

                { shownPages.length > 0 && (
                    <div className={classnames("page-item page-button", this.props.value <= 1 && "disabled")} onClick={()=> this.props.value > 1 && this.props.onChange(this.props.value - 1)}>
                        <span className="page-link" >
                            <i className="fa fa-angle-left"/>
                        </span>
                    </div>
                )}

                {shownPages.length == 0 && (
                    <div className={classnames("page-item active")}
                         onClick={()=> this.props.onChange(1)}
                    ><span className="page-link" >1</span></div>
                )}


                { shownPages.map((p)=> (
                    <div className={classnames("page-item", {active: p.page == this.props.value})}
                         key={p.page}
                         onClick={()=> this.props.onChange(p.page)}
                    ><span className="page-link" >{p.label}</span></div>
                )) }

                { this.props.value < this.props.total && (
                    <div
                        onClick={()=> this.props.value < this.props.total && this.props.onChange(this.props.value + 1)}
                        className={classnames("page-item page-button", this.props.value >= this.props.total && "disabled")}>
                            <span className="page-link">
                                <i className="fa fa-angle-right"/>
                            </span>
                    </div>
                )}

            </div>
        )
    }
}