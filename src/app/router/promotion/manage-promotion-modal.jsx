import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {minVal, required} from "../../components/form/validations";
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
            {"discount" : [required("Giảm Giá"), minVal("Giảm Giá", 0)]},
            {"dates" : [(val) => ({
                    text: "Phải chọn ít nhất 1 ngày",
                    valid: val.length > 0
                })
            ]},
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

                                    <div className="form-group">
                                        <label className="control-label">
                                            Áp dụng cho những ngày
                                        </label>

                                        { promotion.dates.map((date, index) => (
                                            <div className="row"
                                                 key={index}
                                            >
                                                <div className="col-md-10">
                                                    <DatePicker
                                                        value={new Date(date)}
                                                        onChange={(date) => this.setState({promotion: {...promotion, dates: promotion.dates.map((a, i) => i == index ? date : a)}})}
                                                    />
                                                </div>

                                                <div className="col-md-2">
                                                    <button className="btn btn-outline-danger btn-sm"
                                                            onClick={() => this.setState({promotion: {...promotion, dates: promotion.dates.filter((a, i) => i != index)}})}>
                                                        <i className="fa fa-trash"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-danger add-date">
                                            {getInvalidByKey("dates")}
                                        </div>

                                        <div>
                                            <b className="text-primary add-date" onClick={() =>  this.setState({promotion: {...promotion, dates: promotion.dates.concat(new Date())}})}>Thêm ngày</b>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-primary btn-icon">
                                        <span className="btn-inner--text">Lưu</span>
                                        { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
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