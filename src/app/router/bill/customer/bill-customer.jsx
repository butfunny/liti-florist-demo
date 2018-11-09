import React from "react";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {customerApi} from "../../../api/customer-api";
import {formatNumber} from "../../../common/common";
import uuid from "uuid/v4";
import {Checkbox} from "../../../components/checkbox/checkbox";

export class BillCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customerInfo: null
        }
    }

    getCustomerInfo(id) {

        let {onChangeBill, bill} = this.props;

        customerApi.getCustomer(id).then((resp) => {
            onChangeBill({...bill, customerInfo: resp, customer: resp.customer});
        })
    }

    render() {

        let {customer, onChange, editMode, bill, onChangeBill} = this.props;

        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin khách hàng</b>
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
                            </div>
                        )}
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Tên Khách Đặt</label>
                            <Input
                                value={customer.customerName}
                                onChange={(e) => onChange({...customer, customerName: e.target.value})}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Địa Chỉ</label>
                            <Input
                                value={customer.customerPlace}
                                onChange={(e) => onChange({...customer, customerPlace: e.target.value})}
                            />
                        </div>
                    </div>


                    <div className="col-lg-6">
                        <div className="form-group">
                            <label className="control-label">Số Điện Thoại</label>
                            <AutoComplete
                                disabled={editMode}
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
                                    return Promise.resolve([{isNew: true, customerPhone: phone}])
                                }}
                                onSelect={(updatedCustomer) => {
                                    if (updatedCustomer.isNew) {
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
                                    } else {
                                        onChangeBill({...bill, customerInfo: null, payOwe: false});
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
                                value={customer.birthDate ? new Date(customer.birthDate) : new Date()}
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
                </div>
            </div>
        );
    }
}

