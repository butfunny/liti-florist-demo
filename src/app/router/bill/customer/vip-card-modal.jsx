import React, {Fragment} from "react";
import {Input} from "../../../components/input/input";
import {Form} from "../../../components/form/form";
import {vipApi} from "../../../api/vip-api";
export class VipCardModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cardNumber: "",
            isVFamily: false,
            errorCreate: false
        }
    }

    componentDidMount() {
        this.input.focus();
    }

    handleCreate() {
        let {customerID} = this.props;
        let {cardNumber, isVFamily} = this.state;
        vipApi.createVip({
            customerId: customerID,
            cardId: cardNumber,
            isVFamily
        }).then((resp) => {
            if (resp.error) {
                this.setState({errorCreate: true, saving: false})
            } else {
                this.props.onClose();
            }
        })
    }

    render() {

        let {cardNumber, isVFamily, errorCreate, saving} = this.state;
        let {onDismiss, onClose} = this.props;

        const validations = [{
            "cardNumber": [(val) => ({
                text: "Số thẻ phải có độ dài là 8",
                valid: val.toString().length == 8
            })]
        }];

        return (
            <div className="app-modal-box">
                <div className="modal-header">
                    <h5 className="modal-title">Nhập số thẻ VIP</h5>
                    <button type="button" className="close" onClick={() => onDismiss()}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>


                <Form
                    onSubmit={() => {
                        this.setState({saving: true});
                        this.handleCreate()
                    }}
                    formValue={this.state}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <Fragment>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="control-label">Số Thẻ</label>

                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">6666</span>
                                        </div>
                                        <input
                                            ref={elem => this.input = elem}
                                            value={cardNumber}
                                            onChange={(e) => this.setState({cardNumber: e.target.value, errorCreate: false})}
                                            type="number"
                                            className="form-control" placeholder="8 Số cuối"/>
                                    </div>

                                    { getInvalidByKey("cardNumber") && (
                                        <div className="error-text">
                                            {getInvalidByKey("cardNumber")}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="control-label">Loại VIP</label>

                                    <select className="form-control" value={isVFamily}
                                            onChange={(e) => this.setState({isVFamily: e.target.value})}>
                                        <option value={false} >VIP Thường</option>
                                        <option value={true} >VFamily</option>
                                    </select>
                                </div>

                                { errorCreate && (
                                    <div className="loading text-danger text-sm-left">
                                        Thẻ đã được sử dụng
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                        className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit" className="btn btn-info btn-icon">
                                    <span className="btn-inner--text">Tạo</span>
                                    { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </Fragment>
                    )}
                />


            </div>
        );
    }
}