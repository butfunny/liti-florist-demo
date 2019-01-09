import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {maxVal, minVal, required} from "../../components/form/validations";
import {InputNumber} from "../../components/input-number/input-number";
import {DatePicker} from "../../components/date-picker/date-picker";
export class ManagePromotionModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            promotion: props.promotion
        }
    }

    render() {

        let {promotion, saving} = this.state;
        let {onDismiss, onClose} = this.props;


        const validations = [
            {"name" : [required("Tên chiến dịch")]},
            {"discount" : [required("Giảm Giá"), minVal("Giảm Giá", 0), maxVal("Giảm Giá", 100)]},
            {"from" : [(val) => ({
                    text: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
                    valid: new Date(val).getTime() <= new Date(promotion.to).getTime()
                })
            ]},
            {"to" : [(val) => ({
                    text: "Ngày kết thúc phải lớn hơn ngày bắt đầu thúc",
                    valid: new Date(val).getTime() >= new Date(promotion.from).getTime()
                })
            ]}
        ];

        return (
            <div className="app-modal-box manage-promotion-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{promotion._id ? `Sửa chiến dịch ${promotion.name}` : "Thêm chiến dịch"}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => {
                            this.setState({saving: true});
                            onClose(promotion);
                        }}
                        formValue={promotion}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        label="Tên chiến dịch"
                                        value={promotion.name}
                                        onChange={(e) => this.setState({promotion: {...promotion, name: e.target.value}})}
                                        error={getInvalidByKey("name")}
                                    />

                                    <InputNumber
                                        value={promotion.discount}
                                        onChange={(value) => this.setState({promotion: {...promotion, discount: value}})}
                                        label="Giảm giá (%)"
                                        error={getInvalidByKey("discount")}
                                    />

                                    <DatePicker
                                        label="Từ Ngày"
                                        value={new Date(promotion.from)}
                                        onChange={(date) => this.setState({promotion: {...promotion, from: date}})}
                                        error={getInvalidByKey("from")}
                                    />

                                    <DatePicker
                                        label="Tới Ngày"
                                        value={new Date(promotion.to)}
                                        onChange={(date) => this.setState({promotion: {...promotion, to: date}})}
                                        error={getInvalidByKey("to")}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-primary">
                                        <span className="btn-text">Lưu</span>
                                        { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                    </button>
                                </div>
                            </Fragment>
                        )}
                    />


                </div>
            </div>
        );
    }
}