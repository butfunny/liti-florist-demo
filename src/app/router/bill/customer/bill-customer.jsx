import React from "react";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {customerApi} from "../../../api/customer-api";
import {formatNumber, getTotalBill} from "../../../common/common";
import uuid from "uuid/v4";
import {Checkbox} from "../../../components/checkbox/checkbox";
import {vipApi} from "../../../api/vip-api";
import {modals} from "../../../components/modal/modals";
import {VipCardModal} from "./vip-card-modal";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {VipCardReaderModal} from "./vip-card-reader-modal";

export class BillCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customerInfo: null,
            isNotVip: false
        }
    }

    componentDidMount() {
        let {bill} = this.props;
        if (bill.customerId) {
            this.getCustomerInfo(bill.customerId)
        }
    }

    setVipPay(value) {
        this.setState({vipPay: value})
    }

    getCustomerInfo(id) {

        let {onChangeBill, bill} = this.props;

        customerApi.getCustomer(id).then((resp) => {
            vipApi.getVipByCustomerID(id).then((vip) => {
                if (!vip) this.setState({isNotVip: true})
            });

            onChangeBill({...bill, customerInfo: resp, customer: resp.customer});
            this.phone.setValue(resp.customer.customerPhone);
        })
    }

    createVip() {

        let {bill} = this.props;

        const modal = modals.openModal({
            content: (
                <VipCardModal
                    customerID={bill.customer._id}
                    onClose={() => {
                        modal.close();
                        confirmModal.alert("Tạo tài khoản VIP thành công");
                        this.setState({isNotVip: false})
                    }}
                    onDismiss={() => {
                        modal.close()
                    }}
                />
            )
        })
    }

    scanCard() {

        let {onChangeBill, bill} = this.props;

        const modal = modals.openModal({
            content: (
                <VipCardReaderModal
                    onClose={(vip) => {
                        modal.close();
                        onChangeBill({...bill, vipSaleType: vip.isVFamily ? "Giảm giá 20%" : "Giảm giá 5%"});
                        this.setState({vipPay: vip.isVFamily ? "vfamily" : "vip"});
                        this.getCustomerInfo(vip.customerId);
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    render() {

        let {customer, onChange, editMode, bill, onChangeBill, infoComponent} = this.props;
        let {isNotVip, vipPay} = this.state;


        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin khách hàng</b>

                    <br/>

                    { vipPay && (
                        <span className="text-action" style={{fontSize: "13px"}} onClick={() => {
                            this.setState({vipPay: false});
                            onChangeBill({...bill, vipSaleType: null});
                        }}>
                            Chuyển về thanh toán thường
                        </span>
                    )}

                    <div className="vip-card" onClick={() => this.scanCard()}>
                        <i className="fa fa-credit-card"/>
                    </div>
                </div>

                <div className="row">

                    <div className="col-lg-12 info-customer">
                        {bill.customerInfo && (
                            <div className="text-primary">
                                Khách hàng {customer.customerName} đã chi {formatNumber(bill.customerInfo.spend.totalSpend)}

                                {bill.customerInfo.spend.totalOwe > 0 && (
                                    <div>
                                        <span
                                            className="text-danger"> Đang nợ {formatNumber(bill.customerInfo.spend.totalOwe)} </span>
                                        <div style={{marginTop: "10px"}}>
                                            <Checkbox label="Thanh toán nợ" value={bill.payOwe}
                                                      onChange={(value) => onChangeBill({...bill, payOwe: value})}/>
                                        </div>
                                    </div>
                                )}

                                { isNotVip && bill.customerInfo.spend.totalSpend + getTotalBill(bill) >= 15000000 && (
                                    <div>
                                        Khách đã tiêu trên 15,000,000 <b
                                        onClick={() => this.createVip()}
                                        className="text-action">Tạo tài khoản VIP</b>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Người Đặt Hàng</label>
                            <Input
                                disabled={vipPay}
                                value={customer.customerName}
                                onChange={(e) => onChange({...customer, customerName: e.target.value})}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Địa Chỉ</label>
                            <Input
                                disabled={vipPay}
                                value={customer.customerPlace}
                                onChange={(e) => onChange({...customer, customerPlace: e.target.value})}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại</label>
                            <AutoComplete
                                disabled={editMode || vipPay}
                                ref={elem => this.phone = elem}
                                asyncGet={(phone) => {
                                    onChangeBill({
                                        ...bill, customerInfo: null, payOwe: false, customer: {
                                            ...customer,
                                            customerPhone: phone,
                                            customerPlace: "",
                                            email: "",
                                            customerName: "",
                                        },
                                        to: {
                                            ...bill.to,
                                            receiverPhone: "",
                                            receiverName: "",
                                            receiverPlace: "",
                                        }
                                    });

                                    if (phone.length > 3) {
                                        return customerApi.getCustomerByPhone(phone).then((resp) => {
                                            return [{isNew: true, customerPhone: phone}].concat(resp.customers)
                                        })
                                    }
                                    this.setState({isNotVip: false});
                                    return Promise.resolve([{isNew: true, customerPhone: phone}])
                                }}
                                onSelect={(updatedCustomer) => {
                                    if (updatedCustomer.isNew) {
                                        onChangeBill({
                                            ...bill, customerInfo: null, payOwe: false, customer: {
                                                ...customer,
                                                customerPhone: updatedCustomer.customerPhone,
                                                customerPlace: "",
                                                email: "",
                                                customerName: "",
                                            },
                                            to: {
                                                ...bill.to,
                                                receiverPhone: "",
                                                receiverName: "",
                                                receiverPlace: "",
                                            }
                                        });
                                        this.setState({isNotVip: false});
                                    } else {
                                        onChangeBill({...bill, customerInfo: null, payOwe: false});
                                        this.setState({isNotVip: false});
                                        this.getCustomerInfo(updatedCustomer._id);
                                    }
                                }}
                                onChange={(value) => onChange({...customer, customerPhone: value})}
                                objectKey="customerPhone"
                                object={customer}
                                displayAs={(customer) => {
                                    if (customer.isNew) return <span>Khách hàng mới: <b>{customer.customerPhone}</b></span>;
                                    return `${customer.customerPhone} - ${customer.customerName}`
                                }}
                                noPopup
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <Input
                                value={customer.email}
                                onChange={(e) => onChange({...customer, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Ngày Sinh</label>
                            <DatePicker
                                value={customer.birthDate ? new Date(customer.birthDate) : new Date(1976, 0, 1)}
                                onChange={(value) => onChange({...customer, birthDate: value})}
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Giới Tính</label>
                            <select className="form-control"
                                    value={customer.gender}
                                    onChange={(e) => onChange({...customer, gender: e.target.value})}>
                                {["Nam", "Nữ"].map((type, index) => (
                                    <option value={type} key={index}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    { vipPay == "vip" && (
                        <div className="col-lg-6">
                            <div className="form-group">
                                <label className="control-label">VIP sale</label>
                                <select className="form-control" value={bill.vipSaleType}
                                        onChange={(e) => onChangeBill({...bill, vipSaleType: e.target.value})}>
                                    <option value="Giảm giá 5%" >Giảm giá 5%</option>
                                    <option value="Tăng 10% định lượng hoa">Tăng 10% định lượng hoa</option>
                                </select>
                            </div>
                        </div>
                    )}

                    { vipPay == "vfamily" && (
                        <div className="col-lg-6">
                            <div className="form-group">
                                <label className="control-label">VFamily Sale</label>
                                <Input
                                    disabled
                                    value="Giảm giá 20%"
                                />
                            </div>
                        </div>
                    )}

                    { infoComponent()}
                </div>
            </div>
        );
    }
}

