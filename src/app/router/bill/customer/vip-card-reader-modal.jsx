import React, {Fragment} from "react";
import {Input} from "../../../components/input/input";
import {Form} from "../../../components/form/form";
import {vipApi} from "../../../api/vip-api";
import {InputGroup} from "../../../components/input/input-group";
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

                                <InputGroup
                                    label="Số Thẻ"
                                    ref={elem => this.input = elem}
                                    value={cardNumber}
                                    onChange={(e) => this.setState({cardNumber: e.target.value, errorCreate: false})}
                                    badge="6666"
                                    type="number"
                                    error={errorCreate ? errorCreate : getInvalidByKey("cardNumber")}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                        className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit" className="btn btn-primary">
                                    <span className="btn-text">Tìm</span>
                                    { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </Fragment>
                    )}
                />


            </div>
        );
    }
}