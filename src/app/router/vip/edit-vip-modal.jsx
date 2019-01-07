import React from "react";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {customerApi} from "../../api/customer-api";
import {InputGroup} from "../../components/input/input-group";
import {Select} from "../../components/select/select";
import {Input} from "../../components/input/input";
import {InputTag2} from "../../components/input-tag/input-tag-2";
import {premisesInfo} from "../../security/premises-info";
import {viaTypes} from "../../common/constance";
import {DatePicker} from "../../components/date-picker/date-picker";
import {Form} from "../../components/form/form";
import {required} from "../../components/form/validations";
import {vipApi} from "../../api/vip-api";
export class EditVipModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customer: props.customer,
            vipType: props.vip.vipType,
            endDate: props.vip.endDate
        }
    }

    submit() {
        let {customer, vipType, endDate} = this.state;
        let {vip} = this.props;
        this.setState({saving: true});

        customerApi.updateCustomer(customer._id, customer).then(() => {
            vipApi.updateVipDate(vip._id, {
                vipType,
                endDate
            }).then((resp) => {
                if (resp.error) {
                    this.setState({errorCreate: true, saving: false})
                } else {
                    this.props.onClose({
                        vip: {
                            ...vip,
                            vipType,
                            endDate
                        },
                        customer
                    })
                }
            })
        })
    }


    render() {

        let validations = [
            {"@customer.premises": [(val) => ({
                    text: "Phải chọn ít nhất 1 cơ sở",
                    valid: val && val.length > 0
                })
                ]},
            {"@customer.buyerFrom": [(val) => ({
                    text: "Phải chọn ít nhất 1 kênh mua hàng",
                    valid: val && val.length > 0
                })
                ]},
            {"@customer.customerPlace": [required("Địa chỉ")]},
            {"@customer.hobby": [required("Sở thích")]},

        ];

        let {vip, onDismiss} = this.props;
        let {customer, endDate, vipType, saving} = this.state;


        let defaultBirthDate = new Date();
        defaultBirthDate.setFullYear(1970);


        return (
            <div className="edit-vip-modal manage-vip-modal app-modal-box">
                <Form
                    onSubmit={() => this.submit()}
                    formValue={this.state}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sửa thông tin khách VIP</h5>
                                <button type="button" className="close" onClick={() => onDismiss()}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>

                            <div className="modal-body">

                                <InputGroup
                                    badge="6666"
                                    value={vip.cardId}
                                    label="Số Thẻ*"
                                    type="number"
                                    readOnly
                                />


                                <Select
                                    list={["VIP", "VVIP", "FVIP", "CVIP"]}
                                    value={vipType}
                                    onChange={(type) => this.setState({vipType: type})}
                                    label="Loại VIP"
                                />

                                <Input
                                    readOnly
                                    label="Tên Khách Hàng"
                                    value={customer.customerName}
                                />

                                <InputTag2
                                    label="Cở Sở Mua Hàng*"
                                    tags={customer.premises || []}
                                    list={premisesInfo.getPremises().map(p => p.name)}
                                    onChange={(premises) => this.setState({
                                        customer: {
                                            ...customer,
                                            premises
                                        }
                                    })}
                                    error={getInvalidByKey("@customer.premises")}
                                />

                                <InputTag2
                                    label="Kênh Mua Hàng*"
                                    tags={customer.buyerFrom || []}
                                    list={viaTypes}
                                    onChange={(buyerFrom) => this.setState({
                                        customer: {
                                            ...customer,
                                            buyerFrom
                                        }
                                    })}
                                    error={getInvalidByKey("@customer.buyerFrom")}
                                />

                                <DatePicker
                                    label="Ngày Sinh"
                                    value={customer.birthDate ? new Date(customer.birthDate) : defaultBirthDate}
                                    onChange={(birthDate) => this.setState({customer: {...customer, birthDate}})}
                                />

                                <Input
                                    label="Email"
                                    value={customer.email}
                                    onChange={(e) => this.setState({
                                        customer: {
                                            ...customer,
                                            email: e.target.value
                                        }
                                    })}
                                />

                                <Input
                                    label="Địa Chỉ*"
                                    value={customer.customerPlace}
                                    onChange={(e) => this.setState({
                                        customer: {
                                            ...customer,
                                            customerPlace: e.target.value
                                        }
                                    })}
                                    error={getInvalidByKey("@customer.customerPlace")}
                                />

                                <Input
                                    label="Sở Thích*"
                                    value={customer.hobby}
                                    onChange={(e) => this.setState({
                                        customer: {
                                            ...customer,
                                            hobby: e.target.value
                                        }
                                    })}
                                    error={getInvalidByKey("@customer.hobby")}
                                />


                                <DatePicker
                                    label="Ngày Hết Hạn Thẻ"
                                    value={new Date(endDate)}
                                    onChange={(date) => this.setState({endDate: date})}
                                />

                                <Input
                                    textArea
                                    value={customer.notes}
                                    onChange={(e) => this.setState({
                                        customer: {
                                            ...customer,
                                            notes: e.target.value
                                        }
                                    })}
                                    label="Ghi chú"
                                />

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit"
                                        className="btn btn-primary">
                                    <span className="btn-text">Lưu</span>
                                    {saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>
        );
    }
}