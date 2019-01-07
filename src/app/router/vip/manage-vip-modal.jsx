import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {customerApi} from "../../api/customer-api";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {vipApi} from "../../api/vip-api";
import moment from "moment";
import {DatePicker} from "../../components/date-picker/date-picker";
import {InputTag2} from "../../components/input-tag/input-tag-2";
import {premisesInfo} from "../../security/premises-info";
import {viaTypes} from "../../common/constance";
import {Select} from "../../components/select/select";
import {InputGroup} from "../../components/input/input-group";
import {Form} from "../../components/form/form";
import {minLength, required} from "../../components/form/validations";

export class ManageVipModal extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setFullYear(today.getFullYear() + 2);

        this.state = {
            customer: {
                customerPhone: ""
            },
            created: new Date(),
            endDate: today,
            loading: false,
            cardNumber: "",
            vipType: "VIP"
        }
    }

    handleSelect(customer) {
        this.setState({loading: true, customer});
        vipApi.getVipByCustomerID(customer._id).then((vip) => {
            if (vip) {
                this.setState({loading: false, vipAlready: true})
            } else {
                this.setState({loading: false});
                this.form.setShowError(false);
            }
        })
    }

    submit() {
        let {customer, cardNumber, vipType, created, endDate} = this.state;
        this.setState({saving: true});

        customerApi.updateCustomer(customer._id, customer).then(() => {
            vipApi.createVip({
                customerId: customer._id,
                cardId: cardNumber,
                vipType,
                created,
                endDate
            }).then((resp) => {
                if (resp.error) {
                    this.setState({errorCreate: true, saving: false})
                } else {
                    this.props.onClose({
                        vip: {
                            customerId: customer._id,
                            cardId: cardNumber,
                            vipType,
                            created,
                            endDate
                        },
                        customer
                    })
                }
            })
        })
    }

    render() {

        let {customer, vipAlready, saving, cardNumber, errorCreate, vipType, created, endDate} = this.state;
        let {onDismiss} = this.props;
        let defaultBirthDate = new Date();
        defaultBirthDate.setFullYear(1970);


        let validations = [
            {"cardNumber": [required("Số thẻ"), (val) => ({
                    text: "Số thẻ phải có 8 chữ số",
                    valid: val.toString().length == 8
                })
            ]},
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

        return (
            <div className="app-modal-box manage-vip-modal">
                <Form
                    ref={elem => this.form = elem}
                    onSubmit={() => this.submit()}
                    formValue={this.state}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm khách VIP</h5>
                                <button type="button" className="close" onClick={() => onDismiss()}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>

                            <div className="modal-body">
                                <AutoComplete
                                    asyncGet={(phone) => {
                                        if (phone.length > 3) {
                                            return customerApi.getCustomerByPhone(phone).then((resp) => resp.customers)
                                        }

                                        return Promise.resolve([])
                                    }}
                                    onSelect={(customer) => this.handleSelect(customer)}
                                    objectKey="customerPhone"
                                    object={customer}
                                    onChange={(value) => {
                                        this.setState({
                                            customer: {
                                                ...customer,
                                                customerPhone: value,
                                                _id: null,
                                            }, vipAlready: false, errorCreate: false
                                        })
                                    }}
                                    displayAs={(customer) => `${customer.customerPhone} - ${customer.customerName}`}
                                    noPopup
                                    label="Số Điện Thoại Khách"
                                />

                                {customer._id && (
                                    <Fragment>

                                        {vipAlready ? (
                                            <div className="text-danger vip-already">
                                                Khách đã làm vip rồi
                                            </div>
                                        ) : (
                                            <Fragment>
                                                <InputGroup
                                                    badge="6666"
                                                    value={cardNumber}
                                                    onChange={(e) => this.setState({
                                                        cardNumber: e.target.value,
                                                        errorCreate: false
                                                    })}
                                                    label="Số Thẻ*"
                                                    type="number"
                                                    error={getInvalidByKey("cardNumber")}
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

                                                <div className="form-group">

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
                                                </div>

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
                                                    label="Ngày Phát Hành Thẻ"
                                                    value={created}
                                                    onChange={(date) => this.setState({created: date})}
                                                />

                                                <DatePicker
                                                    label="Ngày Hết Hạn Thẻ"
                                                    value={endDate}
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
                                            </Fragment>
                                        )}


                                        {errorCreate && (
                                            <div className="loading text-danger" style={{fontSize: "13px"}}>
                                                Thẻ đã được sử dụng
                                            </div>
                                        )}

                                    </Fragment>
                                )}

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit"
                                        disabled={!customer._id || vipAlready}
                                        className="btn btn-primary">
                                    <span className="btn-text">Lưu</span>
                                    {saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </div>
                    )}
                >
                </Form>
            </div>
        );
    }
}