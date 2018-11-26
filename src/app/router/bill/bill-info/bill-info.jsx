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
import {InputTag} from "../../../components/input-tag/input-tag";
import uniq from "lodash/uniq"
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

    componentWillReceiveProps(props) {
      if (!props.to.receiverPlace || props.to.receiverPlace == "") {
          this.setState({error: false, distance: null})
      }
    }

    render() {

        let {to, onChange, deliverTime, onChangeDeliverTime, bill, onChangeBill, sales, florists, ships} = this.props;
        let {error, distance} = this.state;
        const paymentTypes = ["Ship", "Shop", "Thẻ", "Chuyển Khoản", "Paypal", "Nợ"];


        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin đơn</b>
                </div>

                <div className="row">

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Tên Khách Nhận</label>
                            <AutoCompleteNormal
                                value={to.receiverName}
                                onSelect={(location) => {
                                    onChange({...to, receiverName: location});
                                }}
                                onChange={(value) => {
                                    onChange({...to, receiverName: value})
                                }}
                                displayAs={(location) => location}
                                defaultList={uniq(!bill.customerInfo ? [] : bill.customerInfo.locations.map(l => l.receiverName)).filter(l => l != null && l.length > 0)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại Nhận</label>
                            <AutoCompleteNormal
                                value={to.receiverPhone}
                                onSelect={(location) => {
                                    onChange({...to, receiverPhone: location});
                                }}
                                onChange={(value) => {
                                    onChange({...to, receiverPhone: value})
                                }}
                                displayAs={(location) => location}
                                defaultList={uniq(!bill.customerInfo ? [] : bill.customerInfo.locations.map(l => l.receiverPhone)).filter(l => l != null && l.length > 0)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ngày nhận hàng</label>
                            <DatePicker
                                value={new Date(deliverTime)}
                                onChange={(deliverTime) => onChangeDeliverTime(deliverTime)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Giờ nhận hàng</label>
                            <TimePicker
                                value={new Date(deliverTime)}
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
                                defaultList={
                                    uniq(!bill.customerInfo ? []
                                        : bill.customerInfo.locations
                                            .filter(l => l.receiverPlace != null && l.receiverPlace.length > 0 && l.receiverPhone && l.receiverPhone.indexOf(to.receiverPhone) > -1)
                                            .map(l => l.receiverPlace))}
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
                            <InputTag
                                tags={bill.florists}
                                onChange={(florists) => onChangeBill({...bill, florists})}
                                list={florists}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nhân viên ship</label>
                            <InputTag
                                tags={bill.ships}
                                onChange={(ships) => onChangeBill({...bill, ships})}
                                list={ships}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Hình thức thanh toán</label>
                            <select className="form-control"
                                    value={to.paymentType}
                                    onChange={(e) => onChange({...to, paymentType: e.target.value})}>
                                { paymentTypes.map((type, index) => (
                                    <option value={type} key={index}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Sale</label>
                            <InputTag
                                tags={bill.sales}
                                onChange={(sales) => onChangeBill({...bill, sales})}
                                list={sales.concat(florists)}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ghi Chú</label>
                            <textarea
                                rows="3"
                                className="form-control no-height"
                                value={to.notes}
                                onChange={(e) => onChange({...to, notes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Nội dung thiệp</label>
                            <textarea
                                rows="3"
                                className="form-control no-height"
                                value={to.cardContent}
                                onChange={(e) => onChange({...to, cardContent: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}