import React from "react";
import {Input} from "../../../components/input/input";
import {AutoComplete} from "../../../components/auto-complete/auto-complete";
import {TimePicker} from "../../../components/time-picker/time-picker";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {customerApi} from "../../../api/customer-api";
import {formatNumber} from "../../../common/common";
import uuid from "uuid/v4";
export class BillCustomer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customerInfo: null
        }
    }

    getCustomerInfo(id) {
        customerApi.getCustomer(id).then((resp) => {
            this.setState({customerInfo: resp.spend});
            this.props.onChangeLocations(resp.locations);
        })
    }

    render() {

        let {customer, onChange, editMode, onChangeLocations} = this.props;
        let {customerInfo} = this.state;

        return (
            <div className="bill-customer">
                <div className="panel-header">
                    <b>Thông tin khách hàng</b>
                </div>

                <div className="row">

                    <div className="col-lg-12 info-customer">
                        { customerInfo && (
                            <div className="text-primary">
                                Khách hàng {customer.customerName} đã chi {formatNumber(customerInfo.totalSpend)}

                                { customerInfo.totalOwe > 0 && (<div className="text-danger">Đang nợ {formatNumber(customerInfo.totalOwe)}</div>)}
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
                                    this.setState({customerInfo: null});
                                    onChange({
                                        ...customer,
                                        customerPhone: phone,
                                        receiverName: "",
                                        customerPlace: "",
                                        receiverPlace: "",
                                        email: "",
                                        receiverPhone: "",
                                        customerName: "",
                                    });
                                    onChangeLocations([]);

                                    if (phone.length > 3) {
                                        return customerApi.getCustomerByPhone(phone).then((resp) => {
                                            return [{isNew: true, customerPhone: phone}].concat(resp.customers)
                                        })
                                    }
                                    return Promise.resolve([{isNew: true, customerPhone: phone}])
                                }}
                                onSelect={(updatedCustomer) => {
                                    if (updatedCustomer.isNew) {
                                        onChange({
                                            ...customer,
                                            customerPhone: updatedCustomer.customerPhone,
                                            receiverName: "",
                                            customerPlace: "",
                                            receiverPlace: "",
                                            email: "",
                                            receiverPhone: "",
                                            customerName: "",
                                        });
                                        onChangeLocations([]);
                                        this.setState({oriCustomer: updatedCustomer, customerInfo: null})
                                    } else {
                                        this.setState({oriCustomer: updatedCustomer, customerInfo: null});
                                        this.getCustomerInfo(updatedCustomer._id);
                                        onChange({
                                            ...customer,
                                            ...updatedCustomer
                                        })
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
                                { ["Nam", "Nữ"].map((type, index) => (
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

