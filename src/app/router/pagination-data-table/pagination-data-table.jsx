import React, {Fragment} from "react";
import classnames from "classnames";
import sortBy from "lodash/sortBy";
import {Input} from "../../components/input/input";
import {Pagination} from "../../components/pagination/pagination";
import {formatNumber} from "../../common/common";
export class PaginationDataTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            loading: true,
            isDesc: null,
            keyword: ""
        }
    }

    componentDidMount() {
        this.props.api({page: 1, sortKey: null, isDesc: null, keyword: ""}).then(() => {
            this.setState({loading: false})
        })
    }

    refresh() {
        this.setState({loading: true});
        let {keyword, isDesc, sortIndexCol, page} = this.state;
        let {columns} = this.props;

        this.props.api({page, keyword, isDesc, sortKey: sortIndexCol ? columns[sortIndexCol].sortKey : null}).then(() => {
            this.setState({loading: false})
        })
    }

    reset() {
        let {keyword} = this.state;
        this.setState({loading: true});
        this.props.api({page: 1, sortKey: null, isDesc: null, keyword}).then(() => {
            this.setState({loading: false})
        })
    }


    sort(column, index) {
        let {isDesc, page, keyword} = this.state;
        this.setState({loading: true, page: 1});
        let {api} = this.props;

        this.setState({
            sortIndexCol: index,
            isDesc: this.state.sortIndexCol != index ? true : isDesc === null ? true : isDesc === true ? false : null
        }, () => {
            api({page: 1, keyword, isDesc: this.state.isDesc, sortKey: this.state.isDesc == null ? null : column.sortKey}).then(() => {
                this.setState({loading: false})
            })
        });
    }

    search(value) {
        this.setState({keyword: value, page: 1, isDesc: null, sortIndexCol: null, loading: true});
        this.props.api({page: 1, keyword: value, isDesc: null, sortKey: null}).then(() => {
            this.setState({loading: false})
        })
    }

    changePage(page) {
        let {keyword, isDesc, sortIndexCol} = this.state;
        let {columns} = this.props;
        this.setState({loading: true, page});

        this.props.api({page, keyword, isDesc, sortKey: sortIndexCol ? columns[sortIndexCol].sortKey : null}).then(() => {
            this.setState({loading: false});
        })
    }

    render() {

        let {columns, rows, onClickRow, total} = this.props;
        let {sortIndexCol, isDesc, loading, keyword, page} = this.state;



        return (
            <Fragment>

                <div className="card-body card-body-pagination">
                    <Input
                        style={{marginBottom: "5px", marginTop: "5px"}}
                        onKeyDown={(e) => !loading && e.keyCode == 13 && this.search(e.target.value)}
                        value={keyword}
                        onChange={(e) => this.setState({keyword: e.target.value})}
                        label="Tìm Kiếm"
                        info="Nhấn Enter để bắt đầu tìm kiếm"
                    />
                </div>

                <div className="pagination-data-table"
                    style={{height: !rows ? "300px" : ""}}
                >

                    { loading && (
                        <div className="loading-overlay">
                            <div className="loading-box">
                                Đang Tải... <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>
                            </div>
                        </div>
                    )}

                    <div className="data-table data-table-mobile">
                        <div className="data-table-wrapper">
                            <div className="ge-row ge-table-header">
                                {columns.filter(col => !col.hideDesktop || !col.hideDesktop()).map((column, index) => (
                                    <div
                                        onClick={() => column.sortKey && !loading && this.sort(column, index)}
                                        className={classnames("ge-col", column.sortKey && "has-sort-by", column.className)}
                                        style={{minWidth: `${column.minWidth}px`, width: `${column.width}`}} key={index}>
                                <span className={classnames("label", sortIndexCol == index && isDesc !== null && "sorting")}>
                                    {column.label}

                                    {(sortIndexCol == index && isDesc !== null) && (
                                        <i className={classnames("fa sort-icon", isDesc ? "fa-angle-down" : "fa-angle-up")}/>
                                    )}
                                </span>


                                    </div>
                                ))}
                            </div>
                            <div className="ge-table-body">

                                {rows && rows.length == 0 && (
                                    <div className="ge-row no-data">
                                        Không có dữ liệu
                                    </div>
                                )}

                                {rows && rows.map((row, i) => (
                                    <div className={classnames("ge-row ge-data", onClickRow && "on-click-row")} key={i}
                                         onClick={() => onClickRow && onClickRow(row)}>
                                        {columns.map((column, index) => (
                                            <div
                                                style={{minWidth: `${column.minWidth}px`, width: `${column.width}`}}
                                                className={classnames("ge-col", column.className)} key={index}>
                                                {column.display(row, i)}
                                            </div>
                                        ))}
                                    </div>
                                ))}

                            </div>


                        </div>
                    </div>

                    { rows && rows.length > 0 && (
                        <div className="table-footer">
                            <div className="total">
                                {formatNumber(page * 15 - 14)} - {formatNumber(Math.min(page * 15, total))} / {formatNumber(total)}
                            </div>

                            <Pagination
                                value={page || 1}
                                total={Math.round(total / 15) }
                                onChange={(newPage) => !loading && page != newPage && this.changePage(newPage) }
                            />
                        </div>
                    )}
                </div>
            </Fragment>
        );
    }
}