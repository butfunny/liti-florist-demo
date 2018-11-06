import React from "react";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {customerApi} from "../../../api/customer-api";
import {formatNumber} from "../../../common/common";
export class BillCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            oriCustomer: null
        }
    }

    render() {

        let {customer, onChange, editMode} = this.props;
        let {oriCustomer} = this.state;


        const paymentTypes = ["Ship", "Shop", "Thẻ", "Chuyển Khoản", "Nợ"];

        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin khách hàng</b>
                </div>

                <div className="row">

                    <div className="col-lg-12 info-customer">
                        { oriCustomer && oriCustomer.phone == customer.phone && (
                            <div className="text-primary">
                                Khách hàng {oriCustomer.name} đã chi {formatNumber(oriCustomer.total_pay)}

                                { oriCustomer.total_owe > 0 && (<div className="text-danger">Đang nợ {formatNumber(oriCustomer.total_owe)}</div>)}
                            </div>
                        )}
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Tên Khách Đặt</label>
                            <Input
                                value={customer.name}
                                onChange={(e) => onChange({...customer, name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Tên Khách Nhận</label>
                            <Input
                                value={customer.receiver_name}
                                onChange={(e) => onChange({...customer, receiver_name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Địa Chỉ</label>
                            <Input
                                value={customer.address}
                                onChange={(e) => onChange({...customer, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Địa Chỉ Nhận</label>
                            <Input
                                value={customer.receiver_place}
                                onChange={(e) => onChange({...customer, receiver_place: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại</label>
                            <AutoComplete
                                disabled={editMode}
                                asyncGet={(phone) => customerApi.getCustomerByPhone(phone)}
                                onSelect={(updatedCustomer) => {
                                    this.setState({oriCustomer: updatedCustomer});
                                    onChange({
                                        ...customer,
                                        ...updatedCustomer
                                    })
                                }}
                                onChange={(value) => onChange({...customer, phone: value})}
                                objectKey="phone"
                                object={customer}
                                displayAs={(customer) => `${customer.phone} - ${customer.name}`}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại Nhận</label>
                            <Input
                                value={customer.receiver_phone}
                                onChange={(e) => onChange({...customer, receiver_phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ngày nhận hàng</label>
                            <DatePicker
                                value={new Date(customer.delivery_time)}
                                onChange={(delivery_time) => onChange({...customer, delivery_time})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Giờ nhận hàng</label>
                            <TimePicker
                                value={new Date(customer.delivery_time)}
                                onChange={(delivery_time) => onChange({...customer, delivery_time})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Florist</label>
                            <Input
                                value={customer.florist}
                                onChange={(e) => onChange({...customer, florist: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nhân viên ship (hoặc phí ship)</label>
                            <Input
                                value={customer.ship}
                                onChange={(e) => onChange({...customer, ship: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Hình thức thanh toán</label>
                            <select className="form-control"
                                    value={customer.payment_type}
                                    onChange={(e) => onChange({...customer, payment_type: e.target.value})}>
                                { paymentTypes.map((type, index) => (
                                    <option value={type} key={index}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ghi Chú</label>
                            <Input
                                value={customer.notes}
                                onChange={(e) => onChange({...customer, notes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-12">
                        <div className="form-group">
                            <label className="control-label">Nội dung thiệp</label>
                            <textarea
                                rows="3"
                                className="form-control no-height"
                                value={customer.card}
                                onChange={(e) => onChange({...customer, card: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

