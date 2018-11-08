import React from "react";
import {formatNumber, getShipFees} from "../../../common/common";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {customerApi} from "../../../api/customer-api";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {Checkbox} from "../../../components/checkbox/checkbox";
import {AutoCompleteNormal} from "../../../components/auto-complete/auto-complete-normal";
import {googleMapsApi} from "../../../api/google-maps-api";
import {premisesInfo} from "../../../security/premises-info";
import debounce from "lodash/debounce";
import {InputNumber} from "../../../components/input-number/input-number";
export class BillInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            distance: null
        }
    }


    getDistance = debounce((to) => {
        googleMapsApi.getDistance({from: premisesInfo.getActivePremise().address, to}).then((distance) => {
            this.setState({distance});
            let {deliverTime, onChange, to} = this.props;
            onChange({...to, shipMoney: getShipFees(deliverTime, distance.value / 1000)})
        }, () => {
            this.setState({error: true})
        })
    }, 800);

    getShipMoney(deliverTime) {
        let {distance} = this.state;
        let {to} = this.props;
        if (distance) {
            return getShipFees(deliverTime, distance.value / 1000)
        }

        return to.shipMoney;
    }

    render() {

        let {to, onChange, deliverTime, onChangeDeliverTime, locations} = this.props;
        let {error, distance} = this.state;

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
                                onChange={(deliverTime) => {
                                    onChangeDeliverTime(deliverTime);
                                }}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nơi Nhận</label>
                            <AutoCompleteNormal
                                value={to.receiverPlace}
                                onSelect={(location) => {
                                    onChange({...to, receiverPlace: location});
                                    this.setState({error: false, distance: null});
                                    this.getDistance(location);
                                }}
                                onChange={(value) => {
                                    onChange({...to, receiverPlace: value});
                                    this.setState({error: false, distance: null});
                                    this.getDistance(value)
                                }}
                                displayAs={(location) => location}
                                defaultList={locations}
                                info={error ? "Không tính được khoảng cách vui lòng tư tính tiền ship" : distance ? `Khoảng cách ${distance.text}` : ""}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Phí Ship</label>
                            <InputNumber
                                value={to.shipMoney}
                                onChange={(value) => onChange({...to, shipMoney: value})}
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