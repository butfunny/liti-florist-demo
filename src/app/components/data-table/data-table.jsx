import React, {Fragment} from "react";
import classnames from "classnames";
import sortBy from "lodash/sortBy";
import ReactDOM from "react-dom";
import sumBy from "lodash/sumBy"

export class DataTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sortByFunc: null,
            sortIndexCol: null,
            isDesc: null,
            width: 0
        }
    }


    sort(column, index) {
        let {isDesc} = this.state;
        this.setState({
            sortByFunc: column.sortBy,
            sortIndexCol: index, isDesc: isDesc === null ? false : isDesc === false ? true : null
        });
    }

    render() {

        let {columns, rows, onClickRow, rowStyling, loading} = this.props;
        let {sortByFunc, sortIndexCol, isDesc} = this.state;


        let sortedRows = () => {
            if (isDesc === null) return rows;
            if (isDesc === true) return sortBy(rows, sortByFunc);
            return sortBy(rows, sortByFunc).reverse();
        };


        return (
            <div className="data-table data-table-mobile">
                <div className="data-table-wrapper">
                    <div className="ge-row ge-table-header">
                        {columns.filter(col => !col.hideDesktop || !col.hideDesktop()).map((column, index) => (
                            <div
                                onClick={() => column.sortBy && this.sort(column, index)}
                                className={classnames("ge-col", column.sortBy && "has-sort-by", column.className)}
                                style={{minWidth: `${column.minWidth}px`, width: `${column.width}`}} key={index}>
                                <span className={classnames("label", sortIndexCol == index && isDesc !== null && "sorting")}>
                                    {column.label}

                                    {(sortIndexCol == index && isDesc !== null) && (
                                        <i className={classnames("fa sort-icon", isDesc ? "fa-angle-up" : "fa-angle-down")}/>
                                    )}
                                </span>


                            </div>
                        ))}
                    </div>


                    { (loading || !rows) && (
                        <div className="loading-overlay">
                            <div className="loading-box">
                                Đang Tải... <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>
                            </div>
                        </div>
                    )}


                    { rows && (
                        <div className="ge-table-body">

                            {sortedRows().length == 0 && (
                                <div className="ge-row no-data">
                                    Không có dữ liệu
                                </div>
                            )}

                            {sortedRows().length > 0 && sortedRows().map((row, i) => (
                                <div className={classnames("ge-row ge-data", onClickRow && "on-click-row")} key={i}
                                     onClick={() => onClickRow && onClickRow(row)}>
                                    {columns.map((column, index) => (
                                        <div
                                            style={{minWidth: `${column.minWidth}px`, width: `${column.width}`, ...rowStyling && rowStyling(row)}}
                                            className={classnames("ge-col", column.className)} key={index}>
                                            {column.display(row, i)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                        </div>
                    )}


                </div>


            </div>
        );
    }
}