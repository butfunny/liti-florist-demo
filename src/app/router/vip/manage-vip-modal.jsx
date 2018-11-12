import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {customerApi} from "../../api/customer-api";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {vipApi} from "../../api/vip-api";
import moment from "moment";
export class ManageVipModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customer: {
                customerPhone: ""
            },
            loading: false,
            cardNumber: "",
            isVFamily: false
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
        let {customer, cardNumber, isVFamily} = this.state;
        this.setState({saving: true});
        vipApi.createVip({
            customerId: customer._id,
            cardId: cardNumber,
            isVFamily
        }).then((resp) => {
            if (resp.error) {
                this.setState({errorCreate: true, saving: false})
            } else {
                this.props.onClose({
                    vip: {
                        customerId: customer._id,
                        cardId: cardNumber,
                        isVFamily
                    },
                    customer
                })
            }
        })
    }

    render() {

        let {customer, loading, vipAlready, saving, cardNumber, errorCreate, isVFamily} = this.state;
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
                                        Tên: <b>{customer.customerPhone}</b>
                                    </div>
                                    <div>
                                        Địa chỉ: <b>{customer.customerPlace}</b>
                                    </div>
                                    <div>
                                        Ngày sinh: <b>{moment(customer.birthDate).format("DD/MM/YYYY")}</b>
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

                                            <select className="form-control" value={isVFamily}
                                                    onChange={(e) => this.setState({isVFamily: e.target.value})}>
                                                <option value={false} >VIP Thường</option>
                                                <option value={true} >VFamily</option>
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
                                disabled={!customer._id || vipAlready || saving || cardNumber.toString().length != 8}
                                onClick={() => this.submit()}
                                className="btn btn-primary btn-icon">
                            <span className="btn-inner--text">Lưu</span>
                            { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}