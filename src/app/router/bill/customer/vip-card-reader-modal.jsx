import React, {Fragment} from "react";
import {Input} from "../../../components/input/input";
import {Form} from "../../../components/form/form";
import {vipApi} from "../../../api/vip-api";
export class VipCardReaderModal extends React.Component {

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
        let {cardNumber} = this.state;
        vipApi.getVipByCardID(cardNumber).then((resp) => {
            if (resp.error) {
                this.setState({errorCreate: resp.error, saving: false})
            } else {
                this.props.onClose(resp);
            }
        })
    }

    render() {

        let {cardNumber, errorCreate, saving} = this.state;
        let {onDismiss} = this.props;

        const validations = [{
            "cardNumber": [(val) => ({
                text: "Số thẻ phải có độ dài là 8",
                valid: val.toString().length == 8
            })]
        }];

        return (
            <div className="app-modal-box">
                <div className="modal-header">
                    <h5 className="modal-title">Nhập hoặc quẹt thẻ VIP</h5>
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

                                { errorCreate && (
                                    <div className="loading text-danger text-sm-left">
                                        {errorCreate}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                        className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit" className="btn btn-info btn-icon">
                                    <span className="btn-inner--text">Tìm</span>
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