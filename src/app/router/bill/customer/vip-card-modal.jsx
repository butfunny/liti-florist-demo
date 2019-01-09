import React, {Fragment} from "react";
import {Input} from "../../../components/input/input";
import {Form} from "../../../components/form/form";
import {vipApi} from "../../../api/vip-api";
import {InputGroup} from "../../../components/input/input-group";
import {Select} from "../../../components/select/select";
export class VipCardModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cardNumber: "",
            errorCreate: false,
            vipType: "VIP"
        }
    }

    componentDidMount() {
        this.input.focus();
    }

    handleCreate() {
        let {customerID} = this.props;
        let {cardNumber, vipType} = this.state;

        let created = new Date();
        let endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2);

        vipApi.createVip({
            customerId: customerID,
            cardId: cardNumber,
            vipType,
            created,
            endDate
        }).then((resp) => {
            if (resp.error) {
                this.setState({errorCreate: true, saving: false})
            } else {
                this.props.onClose();
            }
        })
    }

    render() {

        let {cardNumber, errorCreate, saving, vipType} = this.state;
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
                                <InputGroup
                                    label="Số Thẻ"
                                    ref={elem => this.input = elem}
                                    value={cardNumber}
                                    onChange={(e) => this.setState({cardNumber: e.target.value, errorCreate: false})}
                                    badge="6666"
                                    type="number"
                                    error={errorCreate ? "Thẻ đã được sử dụng" : getInvalidByKey("cardNumber")}
                                />

                                <Select
                                    list={["VIP", "VVIP", "FVIP", "CVIP"]}
                                    value={vipType}
                                    onChange={(type) => this.setState({vipType: type})}
                                    label="Loại VIP"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                        className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit" className="btn btn-primary btn-icon">
                                    <span className="btn-text">Tạo</span>
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