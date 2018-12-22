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
                this.setState({loading: false})
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
                            vipType
                        },
                        customer
                    })
                }
            })
        })
    }

    render() {

        let {customer, loading, vipAlready, saving, cardNumber, errorCreate, vipType, created, endDate} = this.state;
        let {onDismiss} = this.props;



        return (
            <div className="app-modal-box manage-vip-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Thêm khách VIP</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-group">
                            <label className="control-label"> Số Điện Thoại Khách</label>

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
                                onChange={(value) => this.setState({customer: {...customer, customerPhone: value, _id: null}, vipAlready: false, errorCreate: false})}
                                displayAs={(customer) => `${customer.customerPhone} - ${customer.customerName}`}
                                noPopup
                            />
                        </div>

                        { customer._id && (
                            <Fragment>
                                <div className="form-group">
                                    <label className="control-label">Thông Tin Khách Hàng</label>
                                    <div>
                                        Tên: <b>{customer.customerName}</b>
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Ngày sinh</label>

                                        <DatePicker
                                            value={customer.birthDate ? new Date(customer.birthDate) : new Date()}
                                            onChange={(birthDate) => this.setState({customer: {...customer, birthDate}})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Email</label>

                                        <input className="form-control"
                                               value={customer.email}
                                               onChange={(e) => this.setState({customer: {...customer, email: e.target.value}})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Địa chỉ*</label>

                                        <input className="form-control"
                                               value={customer.customerPlace}
                                               onChange={(e) => this.setState({customer: {...customer, customerPlace: e.target.value}})}
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label className="control-label">Sở thích*</label>

                                        <input className="form-control"
                                               value={customer.hobby || ""}
                                               onChange={(e) => this.setState({customer: {...customer, hobby: e.target.value}})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Ngày phát hành thẻ</label>

                                        <DatePicker
                                            value={created}
                                            onChange={(date) => this.setState({created: date})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Ngày hết hạn thẻ</label>

                                        <DatePicker
                                            value={endDate}
                                            onChange={(date) => this.setState({endDate: date})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Ghi chú</label>

                                        <textarea
                                            className="form-control"
                                            style={{
                                                resize: "none"
                                            }}
                                            value={customer.notes} onChange={(e) => this.setState({customer: {...customer, notes: e.target.value}})}/>
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Cơ sở mua hàng</label>

                                        <InputTag2
                                            tags={customer.premises || []}
                                            noPlaceholder
                                            list={premisesInfo.getPremises().map(p => p.name)}
                                            onChange={(premises) => this.setState({customer: {...customer, premises}})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="control-label">Kênh mua hàng</label>

                                        <InputTag2
                                            tags={customer.buyerFrom || []}
                                            noPlaceholder
                                            list={viaTypes}
                                            onChange={(buyerFrom) => this.setState({customer: {...customer, buyerFrom}})}
                                        />
                                    </div>
                                </div>

                                { loading && (
                                    <div className="loading text-primary text-sm-left">
                                        Đang lấy thông tin khách hàng <i className="fa fa-spinner fa-pulse"/>
                                    </div>
                                )}

                                { vipAlready && (
                                    <div className="loading text-danger text-sm-left">
                                        Khách đã làm vip rồi
                                    </div>
                                )}



                                { !vipAlready && (
                                    <Fragment>
                                        <div className="form-group">
                                            <label className="control-label">Số Thẻ</label>

                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">6666</span>
                                                </div>
                                                <input
                                                    value={cardNumber}
                                                    onChange={(e) => this.setState({cardNumber: e.target.value, errorCreate: false})}
                                                    type="number"
                                                    className="form-control" placeholder="8 Số cuối"/>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="control-label">Loại VIP</label>

                                            <select className="form-control" value={vipType}
                                                    onChange={(e) => this.setState({vipType: e.target.value})}>
                                                <option value="VIP" >VIP</option>
                                                <option value="VVIP" >VVIP</option>
                                                <option value="FVIP" >FVIP</option>
                                                <option value="CVIP" >CVIP</option>
                                            </select>
                                        </div>
                                    </Fragment>
                                )}

                                { errorCreate && (
                                    <div className="loading text-danger text-sm-left">
                                        Thẻ đã được sử dụng
                                    </div>
                                )}

                            </Fragment>
                        )}

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                        <button type="submit"
                                disabled={!customer._id || vipAlready
                                || saving || cardNumber.toString().length != 8 ||
                                customer.customerPlace.length == 0 ||
                                !customer.premises || customer.premises.length == 0 ||
                                !customer.hobby || customer.hobby.length == 0 ||
                                !customer.buyerFrom || customer.buyerFrom.length == 0
                            }
                                onClick={() => this.submit()}
                                className="btn btn-info btn-icon">
                            <span className="btn-inner--text">Lưu</span>
                            { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}