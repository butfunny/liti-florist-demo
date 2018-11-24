import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManageVipModal} from "./manage-vip-modal";
import {vipApi} from "../../api/vip-api";
import moment from "moment";
import {Input} from "../../components/input/input";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {securityApi} from "../../api/security-api";
import {Checkbox} from "../../components/checkbox/checkbox";
export class VipRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            vips: null,
            customers: null,
            keyword: "",
            filterBirthDay: false
        };

        vipApi.getVipList().then(({customers, vips}) => this.setState({vips, customers}))
    }

    addVip() {
        const modal = modals.openModal({
            content: (
                <ManageVipModal
                    onDismiss={() => modal.close()}
                    onClose={({vip, customer}) => {
                        let {vips, customers} = this.state;
                        this.setState({vips: vips.concat(vip), customers: customers.concat(customer)});
                        modal.close();
                    }}
                />
            )
        })
    }

    remove(vip) {
        confirmModal.show({
            title: `Xoá khách vip?`,
            description: "Bạn có đồng ý xoá quyền lợi vip của khách này không?"
        }).then(() => {
            vipApi.removeVIP(vip._id);
            let {vips} = this.state;
            this.setState({
                vips: vips.filter(v => v._id != vip._id)
            })
        })
    }

    render() {

        let {vips, customers, keyword, filterBirthDay} = this.state;

        const getCustomer = (customerID) => customers.find(c => c._id == customerID);
        let today = new Date();

        const vipsFiltered = vips && vips.filter((vip) => {
            let customer = getCustomer(vip.customerId);

            if (filterBirthDay) {
                if (!customer.birthDate) return false;
                let customerBirthDay = new Date(customer.birthDate);
                if (customerBirthDay.getMonth() != today.getMonth()) {
                    return false;
                }
            }

            return vip.cardId.toLowerCase().indexOf(keyword.toLowerCase()) > - 1 ||
            customer.customerName.toLowerCase().indexOf(keyword.toLowerCase()) > - 1 ||
            customer.customerPhone.toLowerCase().indexOf(keyword.toLowerCase()) > - 1
        });

        return (
            <Layout
                activeRoute="Khách Hàng"
            >
                <div className="manage-premises-route manage-user-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Quản lý khách hàng VIP</h1>
                        <div className="avatar-group mt-3">
                        </div>
                    </div>

                    <hr/>

                    <div className="margin-bottom">
                        <button type="button" className="btn btn-info" onClick={() => this.addVip()}>Thêm khách VIP</button>
                    </div>

                    <div className="form-group">
                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            placeholder="Tìm kiếm theo tên, sđt và số thẻ"
                        />
                    </div>

                    <Checkbox
                        label="Lọc khách VIP có sinh nhật trong tháng"
                        value={filterBirthDay}
                        onChange={(filterBirthDay) => this.setState({filterBirthDay})}
                    />

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Thông Tin Khách</th>
                            <th scope="col">Loại VIP</th>
                            <th scope="col">Tác Vụ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vips && vipsFiltered.map((item, index) => {

                            let customer = getCustomer(item.customerId);

                            return (
                                <tr key={index}>
                                    <td>
                                        <div>Tên: <b>{customer.customerName}</b></div>
                                        <div>Số Điện Thoại: <b>{customer.customerPhone}</b></div>
                                        <div>Địa chỉ: <b>{customer.customerPlace}</b></div>
                                        { customer.birthDate && <div>Ngày Sinh: <b>{moment(new Date(customer.birthDate)).format("DD/MM/YYYY")}</b></div>}
                                        <div>Số Thẻ: <b>6666 {item.cardId.toString().substr(0, 4) + " " + item.cardId.toString().substr(4, 7)}</b></div>

                                    </td>

                                    <td
                                        style={{minWidth: "200px"}}
                                    >
                                        {item.isVFamily ? "VFamily" : "VIP Thường"}
                                    </td>
                                    <td
                                        style={{minWidth: "150px"}}
                                    >
                                        <button className="btn btn-outline-danger btn-sm"
                                                onClick={() => this.remove(item)}>
                                            <i className="fa fa-trash"/>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                </div>
            </Layout>
        );
    }
}