import React from "react";
import {premisesInfo} from "../../security/premises-info";
import {Select} from "../../components/select/select";
import {billApi} from "../../api/bill-api";
export class MoveBillModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: premisesInfo.getActivePremise()._id,
            loading: false
        }
    }

    submit() {
        let {billID, onClose} = this.props;
        let {value} = this.state;
        this.setState({loading: true});
        billApi.moveBill(billID, {premises_id: value}).then(() => {
            onClose();
        })
    }

    render() {

        const premises = premisesInfo.getPremises();
        let {onDismiss} = this.props;
        let {value, loading} = this.state;


        return (
            <div className="app-modal-box move-bill-modal">
                <div className="modal-header">
                    <h5 className="modal-title">Chuyển Đơn</h5>
                    <button type="button" className="close" onClick={() => onDismiss()}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="modal-body">
                    <Select
                        label="Chọn Cơ Sở"
                        value={value}
                        list={premises.map(p => p._id)}
                        onChange={(value) => this.setState({value})}
                        displayAs={(id) => premises.find(p => p._id == id).name}
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-link " data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    <button type="button" className="btn btn-primary " data-dismiss="modal" onClick={() => this.submit()}>
                        <span className="btn-text">
                            Cập Nhật
                        </span>

                        { loading && <span className="loading-icon"><i className="fa fa-spinner fa fa-spinner fa-pulse"/></span>}
                    </button>
                </div>
            </div>
        );
    }
}