import React from "react";
export class ColumnViewMore extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInfo: false
        }
    }

    componentWillReceiveProps(props) {
        this.setState({showInfo: false})
    }

    render() {

        let {header, renderViewMoreBody, viewMoreText = "Xem Thêm", isShowViewMoreText = true, subText} = this.props;
        let {showInfo} = this.state;

        return (
            <div className="column-view-more">
                {header} {isShowViewMoreText && <span className="show-info" onClick={() => this.setState({showInfo: !showInfo})}>{showInfo ? "Ẩn" : viewMoreText}</span>}

                { subText && (
                    <div className="sub-text">
                        {subText}
                    </div>
                )}

                <div className="info-wrapper">
                    { showInfo && renderViewMoreBody()}
                </div>
            </div>
        );
    }
}