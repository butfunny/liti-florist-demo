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
import {Select} from "../../../components/select/select";

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
                        const vipSales = {
                            "VIP": 5,
                            "VVIP": 10,
                            "FVIP": 20,
                            "CVIP": 30
                        };

                        onChangeBill({...bill, vipSaleType: `Giảm giá ${vipSales[vip.vipType]}%`});
                        this.setState({vipPay: vip.vipType});
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
            <div className="bill-customer card">

                <div className="card-title">
                    Thông tin khách hàng

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

                    { bill.customerInfo && (
                        <div className="text-primary text-small">
                            Khách hàng {customer.customerName} đã chi {formatNumber(bill.customerInfo.spend.totalSpend)}

                            {bill.customerInfo.spend.totalOwe > 0 && (
                                <div>
                                    <span
                                            className="text-danger"> Đang nợ {formatNumber(bill.customerInfo.spend.totalOwe)} </span>
                                    <div style={{marginTop: "5px", marginBottom: "5px"}}>
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

                <div className="card-body">
                    <div className="row">
                        <Input
                            className="col"
                            label="Tên Người Đặt*"
                            readOnly={vipPay}
                            value={customer.customerName}
                            onChange={(e) => onChange({...customer, customerName: e.target.value})}
                        />

                        <Input
                            className="col"
                            label="Địa Chỉ"
                            disabled={vipPay}
                            value={customer.customerPlace}
                            onChange={(e) => onChange({...customer, customerPlace: e.target.value})}
                        />
                    </div>

                    <div className="row">

                        <AutoComplete
                            className="col"
                            label="Số Điện Thoại*"
                            readOnly={editMode || vipPay}
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
                                        return resp.customers
                                    })
                                }
                                this.setState({isNotVip: false});
                                return Promise.resolve([])
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
                            displayAs={(customer) => `${customer.customerPhone} - ${customer.customerName}`}
                            noPopup
                        />


                        <Input
                            className="col"
                            label="Email"
                            readOny={vipPay}
                            value={customer.email}
                            onChange={(e) => onChange({...customer, email: e.target.value})}
                        />
                    </div>

                    <div className="row">
                        <DatePicker
                            label="Ngày Sinh"
                            className="col"
                            value={customer.birthDate ? new Date(customer.birthDate) : new Date(1976, 0, 1)}
                            onChange={(value) => onChange({...customer, birthDate: value})}
                        />

                        <Select
                            className="col"
                            value={customer.gender}
                            onChange={(gender) => onChange({...customer, gender})}
                            list={["Nam", "Nữ"]}
                            label="Giới Tính"
                        />
                    </div>

                    <div className="row">
                        { vipPay == "VIP" && (
                            <Select
                                label="VIP sale"
                                value={bill.vipSaleType}
                                list={["Giảm giá 5%", "Tăng 10% định lượng hoa"]}
                                onChange={(vipSaleType) => onChangeBill({...bill, vipSaleType})}
                            />
                        )}

                        { ["VVIP", "FVIP", "CVIP"].indexOf(vipPay) > -1 && (
                            <Input
                                readOnly
                                label={`${vipPay} Sale`}
                                value={bill.vipSaleType}
                            />
                        )}
                    </div>

                    { infoComponent()}

                </div>

            </div>
        );
    }
}

