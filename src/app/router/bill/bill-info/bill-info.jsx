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
import {paymentTypes, viaTypes} from "../../../common/constance";

export class BillInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            distance: null,
            selectedSale: null
        }
    }


    getDistance = debounce((to) => {
        googleMapsApi.getDistance({from: premisesInfo.getActivePremise().address, to}).then((distance) => {
            this.setState({distance});
            let {deliverTime, onChange, to, bill} = this.props;
            onChange({...to, shipMoney: getShipFees(bill, distance.value / 1000), distance: distance.value / 1000})
        }, () => {
            this.setState({error: true, distance: 0})
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
        let {error, distance, selectedSale} = this.state;


        const billSaleSelected = bill.sales.find(b => b.username == selectedSale);

        return (
            <div className="row">

                <div className="col-lg-6">
                    <div className="form-group">
                        <label className="control-label">Người Nhận Hàng</label>
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
                        <label className="control-label">Hình thức thanh toán</label>
                        <select className="form-control"
                                value={to.paymentType}
                                onChange={(e) => onChange({...to, paymentType: e.target.value})}>
                            { paymentTypes.slice(1).map((type, index) => (
                                <option value={type} key={index}>{type}</option>
                            ))}
                        </select>

                        { to.paymentType == "Thẻ" && (
                            <Input
                                placeholder="MCC"
                                value={to.mcc}
                                onChange={(e) => onChange({...to, mcc: e.target.value})}
                            />
                        )}
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="form-group">
                        <label className="control-label">Kênh mua hàng</label>
                        <select className="form-control"
                                value={to.buyerFrom}
                                onChange={(e) => onChange({...to, buyerFrom: e.target.value})}>
                            { viaTypes.map((type, index) => (
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
                            list={sales.map(s => ({...s, isSale: true})).concat(florists)}
                            onClick={(sale) => this.setState({selectedSale: sale})}
                        />
                    </div>

                    { billSaleSelected && (
                        <div className="bill-sale">
                            <b>{billSaleSelected.username}</b>

                            <div className="custom-control custom-radio mb-3"
                                 onClick={() => onChangeBill({...bill, sales: bill.sales.map(s => s.username == billSaleSelected.username ? ({...s, isOnl: true}) : s)})}
                            >
                                <input name="custom-radio-1" className="custom-control-input"
                                       checked={billSaleSelected.isOnl}
                                       onChange={() => {}}
                                       type="radio"/>
                                <label className="custom-control-label" htmlFor="customRadio1">Online</label>
                            </div>
                            <div className="custom-control custom-radio mb-3"
                                 onClick={() => onChangeBill({...bill, sales: bill.sales.map(s => s.username == billSaleSelected.username ? ({...s, isOnl: false}) : s)})}
                            >
                                <input name="custom-radio-1" className="custom-control-input" id="customRadio2"
                                       onChange={() => {}}
                                       checked={!billSaleSelected.isOnl} type="radio"/>
                                <label className="custom-control-label" htmlFor="customRadio2">Offline</label>
                            </div>
                        </div>
                    )}
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
                    <Input
                        label="Ghi Chú"
                        value={to.notes}
                        onChange={(e) => onChange({...to, notes: e.target.value})}
                    />
                </div>

                <div className="col-lg-12">
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
        );
    }
}