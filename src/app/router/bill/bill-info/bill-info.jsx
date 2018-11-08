import React from "react";
import {formatNumber} from "../../../common/common";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {customerApi} from "../../../api/customer-api";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {TimePicker} from "../../../components/time-picker/time-picker";
export class BillInfo extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {customer = {}, onChange, editMode} = this.props;

        const paymentTypes = ["Ship", "Shop", "Thẻ", "Chuyển Khoản", "Nợ"];


        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin đơn</b>
                </div>

                <div className="row">

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Tên Khách Nhận</label>
                            <Input
                                value={customer.receiverName}
                                onChange={(e) => onChange({...customer, receiverName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Địa Chỉ Nhận</label>
                            <Input
                                value={customer.receiverPlace}
                                onChange={(e) => onChange({...customer, receiverPlace: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại Nhận</label>
                            <Input
                                value={customer.receiverPhone}
                                onChange={(e) => onChange({...customer, receiverPhone: e.target.value})}
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