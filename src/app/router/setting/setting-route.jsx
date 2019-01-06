import React from "react";
import {Layout} from "../../components/layout/layout";
import {ColorSetting} from "./color-setting";
import {TypeSetting} from "./type-setting";
import {permissionInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {security} from "../../security/secuiry-fe";
import {customerApi} from "../../api/customer-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {warehouseApi} from "../../api/warehouse-api";

export class SettingRoute extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            customers: null,
            doneIndex: 0
        }

        customerApi.getCustomersAll().then((customers) => {
            this.setState({customers})
        })
    };


    updatePay() {
        let {customers} = this.state;

        const upload = (index) => {
            if (index == customers.length - 1) {
                this.setState({uploading: false});
                confirmModal.alert(`Thêm thành công ${customers.length} sản phẩm`);
            } else {
                let item = customers[index];
                this.setState({doneIndex: index + 1});
                customerApi.updateCustomerPay(item._id).then(() => {
                    upload(index + 1)
                })
            }
        };

        upload(0);
    }

    render() {

        let {customers, doneIndex} = this.state;
        const user = userInfo.getUser();

        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">

                    {security.isHavePermission(["bill.editProductColor"]) && (
                        <ColorSetting />
                    )}

                    { security.isHavePermission(["bill.editProductType"]) && (
                        <TypeSetting/>
                    )}


                    { user.username == "cuongnguyen" && (
                        <button
                            disabled={!customers}
                            className="btn btn-primary"
                            onClick={() => this.updatePay()}>Cập nhật khách hàng ({doneIndex} / {customers ? customers.length : 0})</button>
                    )}


                </div>
            </Layout>
        );
    }
}