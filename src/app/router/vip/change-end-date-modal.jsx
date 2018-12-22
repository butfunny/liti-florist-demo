import React from "react";
import {DatePicker} from "../../components/date-picker/date-picker";
import {vipApi} from "../../api/vip-api";
export class ChangeEndDateModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            endDate: new Date(props.vip.endDate)
        }
    }

    submit() {
        let {vip, onClose} = this.props;
        let {endDate} = this.state;
        this.setState({saving: true});
        vipApi.updateVipDate(vip._id, {endDate}).then(() => {
            onClose(endDate)
        })
    }

    render() {
        let {onDismiss, vip} = this.props;
        let {endDate, saving} = this.state;

        return (
            <div className="change-end-date-modal app-modal-box">
                <div className="modal-header">
                    <h5 className="modal-title">Gia hạn thẻ</h5>
                    <button type="button" className="close" onClick={() => onDismiss()}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="control-label">Ngày hết hạn thẻ</label>

                        <DatePicker
                            value={endDate}
                            onChange={(date) => this.setState({endDate: date})}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                    <button type="submit"
                            onClick={() => this.submit()}
                            className="btn btn-info btn-icon">
                        <span className="btn-inner--text">Lưu</span>
                        { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                    </button>
                </div>
            </div>
        );
    }
}