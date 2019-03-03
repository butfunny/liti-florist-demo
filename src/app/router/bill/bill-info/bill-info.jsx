import React, {Fragment} from "react";
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
import {Select} from "../../../components/select/select";
import {InputTag2} from "../../../components/input-tag/input-tag-2";
import {Radio} from "../../../components/radio/radio";

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
            <Fragment>

                <div className="row">
                    <AutoCompleteNormal
                        label="Người Nhận Hàng*"
                        className="col"
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

                    <AutoCompleteNormal
                        label="Số Điện Thoại Nhận*"
                        className="col"
                        value={to.receiverPhone}
                        onSelect={(location) => {
                            onChange({...to, receiverPhone: location});
                        }}
                        onChange={(value) => {
                            onChange({...to, receiverPhone: value})
                        }}
                        displayAs={(location) => location}
                        defaultList={uniq(!bill.customerInfo ? []
                            : bill.customerInfo.locations
                            .filter(l => l.receiverPhone != null && l.receiverPhone.length > 0 && l.receiverName && l.receiverName.indexOf(to.receiverName) > -1)
                            .map(l => l.receiverPhone))
                        }
                    />
                </div>



                <div className="row">
                    <DatePicker
                        className="col"
                        label="Ngày nhận hàng*"
                        value={new Date(deliverTime)}
                        onChange={(deliverTime) => onChangeDeliverTime(deliverTime)}
                    />

                    <TimePicker
                        className="col"
                        value={new Date(deliverTime)}
                        onChange={(deliverTime) => {
                            onChangeDeliverTime(deliverTime);
                        }}
                    />
                </div>

                <div className="row">
                    <AutoCompleteNormal
                        className="col"
                        label="Nơi Nhận*"
                        value={to.receiverPlace}
                        onSelect={(location) => {
                            onChange({...to, receiverPlace: location});
                            this.setState({error: false, distance: null});
                            // this.getDistance(location);
                        }}
                        onChange={(value) => {
                            onChange({...to, receiverPlace: value});
                            this.setState({error: false, distance: null});
                            // this.getDistance(value)
                        }}
                        displayAs={(location) => location}
                        defaultList={
                            uniq(!bill.customerInfo ? []
                                : bill.customerInfo.locations
                                .filter(l => l.receiverPlace != null && l.receiverPlace.length > 0 && l.receiverName && l.receiverName.indexOf(to.receiverName) > -1)
                                .map(l => l.receiverPlace))}
                        info={error ? "Không tính được khoảng cách vui lòng tư tính tiền ship" : distance ? `Khoảng cách ${distance.text}` : ""}
                    />

                    <InputNumber
                        label="Phí Ship"
                        className="col"
                        value={to.shipMoney}
                        onChange={(value) => onChange({...to, shipMoney: value})}
                    />
                </div>

                <div className="row">

                    <div className="col">
                        <Select
                            label="Hình Thức Thanh Toán*"
                            onChange={(paymentType) => onChange({...to, paymentType})}
                            list={paymentTypes.slice(1)}
                            value={to.paymentType}
                        />

                        { to.paymentType == "Thẻ" && (
                            <Input
                                label="MCC"
                                value={to.mcc}
                                onChange={(e) => onChange({...to, mcc: e.target.value})}
                            />
                        )}
                    </div>


                    <Select
                        label="Kênh Mua Hàng*"
                        value={to.buyerFrom}
                        onChange={(buyerFrom) => onChange({...to, buyerFrom})}
                        list={viaTypes}
                        className="col"
                    />

                </div>

                <div className="row">
                    <div className="col tag-sale">
                        <InputTag
                            label="Sale"
                            tags={bill.sales}
                            onChange={(sales) => onChangeBill({...bill, sales})}
                            list={sales.map(s => ({...s, isSale: true})).concat(florists)}
                            onClick={(sale) => this.setState({selectedSale: sale})}
                        />

                        { billSaleSelected && (
                            <div className="bill-sale">
                                <b>{billSaleSelected.username}</b>
                                <Radio
                                    label="Online"
                                    value={billSaleSelected.isOnl}
                                    onChange={() => onChangeBill({...bill, sales: bill.sales.map(s => s.username == billSaleSelected.username ? ({...s, isOnl: true}) : s)})}
                                />

                                <Radio
                                    label="Offline"
                                    value={!billSaleSelected.isOnl}
                                    onChange={() => onChangeBill({...bill, sales: bill.sales.map(s => s.username == billSaleSelected.username ? ({...s, isOnl: false}) : s)})}
                                />
                            </div>
                        )}
                    </div>

                    <div className="col">
                        <InputTag
                            label="Florist"
                            tags={bill.florists}
                            onChange={(florists) => onChangeBill({...bill, florists})}
                            list={florists}
                        />
                    </div>
                </div>



                <div className="row">
                    <InputTag
                        className="col"
                        label="Ship"
                        tags={bill.ships}
                        onChange={(ships) => onChangeBill({...bill, ships})}
                        list={ships}
                    />

                    <Input
                        className="col"
                        label="Ghi Chú"
                        value={to.notes}
                        onChange={(e) => onChange({...to, notes: e.target.value})}
                    />

                </div>

                <div className="row">

                    <InputNumber
                        label="Phụ Thu"
                        className="col"
                        value={bill.surcharge}
                        onChange={(value) => onChangeBill({...bill, surcharge: value})}
                    />

                    <InputTag
                        className="col"
                        label="Người hưởng"
                        tags={bill.surchargeMember}
                        onChange={(surchargeMember) => onChangeBill({...bill, surchargeMember})}
                        list={sales.map(s => ({...s, isSale: true})).concat(florists)}
                    />

                </div>


                <Input
                    className="col"
                    label="Nội Dung Thiệp"
                    textArea
                    value={to.cardContent}
                    onChange={(e) => onChange({...to, cardContent: e.target.value})}
                />
            </Fragment>
        );
    }
}