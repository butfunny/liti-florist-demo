import React from "react";
import {formatNumber} from "../../../common/common";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {customerApi} from "../../../api/customer-api";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {Checkbox} from "../../../components/checkbox/checkbox";
import {AutoCompleteNormal} from "../../../components/auto-complete/auto-complete-normal";
export class BillInfo extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {to, onChange, deliverTime, onChangeDeliverTime, locations} = this.props;

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
                                value={to.receiverName}
                                onChange={(e) => onChange({...to, receiverName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại Nhận</label>
                            <Input
                                value={to.receiverPhone}
                                onChange={(e) => onChange({...to, receiverPhone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ngày nhận hàng</label>
                            <DatePicker
                                value={deliverTime}
                                onChange={(deliverTime) => onChangeDeliverTime(deliverTime)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Giờ nhận hàng</label>
                            <TimePicker
                                value={deliverTime}
                                onChange={(deliverTime) => onChangeDeliverTime(deliverTime)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nơi Nhận</label>
                            <AutoCompleteNormal
                                value={to.receiverPlace}
                                onSelect={(location) => onChange({...to, receiverPlace: location})}
                                onChange={(value) => onChange({...to, receiverPlace: value})}
                                displayAs={(location) => location}
                                defaultList={locations}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Phí Ship</label>
                            <Input
                                value={to.ship}
                                onChange={(e) => onChange({...to, ship: e.target.value})}
                            />
                        </div>
                    </div>



                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Florist</label>
                            <Input
                                value={to.florist}
                                onChange={(e) => onChange({...to, florist: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nhân viên ship (hoặc phí ship)</label>
                            <Input
                                value={to.ship}
                                onChange={(e) => onChange({...to, ship: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Hình thức thanh toán</label>
                            <select className="form-control"
                                    value={to.payment_type}
                                    onChange={(e) => onChange({...to, payment_type: e.target.value})}>
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
                                value={to.notes}
                                onChange={(e) => onChange({...to, notes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-12">
                        <div className="form-group">
                            <label className="control-label">Nội dung thiệp</label>
                            <textarea
                                rows="3"
                                className="form-control no-height"
                                value={to.card}
                                onChange={(e) => onChange({...to, card: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}