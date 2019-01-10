import React, {Fragment} from "react";
import {LeftSide} from "../bill/left-side/left-side";
import {BillView} from "../bill/bill-view/bill-view";
import {Form} from "../../components/form/form";
import {BillCustomer} from "../bill/customer/bill-customer";
import {Layout} from "../../components/layout/layout";
import {required} from "../../components/form/validations";
import {customerApi} from "../../api/customer-api";
import pick from "lodash/pick";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {billApi} from "../../api/bill-api";
import omit from "lodash/omit";
import {formatValue} from "../../common/common";
import {PrintService} from "../../common/print-service/print-service";
import {BillPrint} from "../bill/print/bill-print";
import {modals} from "../../components/modal/modals";
import {UpdateReasonModal} from "./update-reason-modal";
import {userInfo} from "../../security/user-info";
import classnames from "classnames";
import {BillInfo} from "../bill/bill-info/bill-info";
import {securityApi} from "../../api/security-api";
import {permissionInfo} from "../../security/premises-info";
import {security} from "../../security/secuiry-fe";
export class BillEditRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bill: null,
            saving: false,
            locations: []
        };

        securityApi.getSalesAndFlorist().then((users) => {

            const mapItem = (u) => ({
                user_id: u._id,
                name: u.name,
                username: u.username
            });

            this.setState({
                sales: users.filter(u => u.role == "sale").map(mapItem),
                florists: users.filter(u => u.role == "florist").map(mapItem),
                ships: users.filter(u => u.role == "ship").map(mapItem)
            })
        });

        billApi.getBillById(props.match.params.id).then(({bill, customer}) => {
            this.setState({bill: {...bill, customer: {...customer, ...bill}}})
        })
    }

    submitBill() {

        let {history} = this.props;
        let {bill} = this.state;

        const handleUpdate = (reason) => {
            billApi.updateBill(bill._id, {
                ...bill,
                reason,
                update_time: new Date()
            }).then(() => {
                confirmModal.alert("Cập nhật thành công");
                history.push("/");
            })
        };

        const modal = modals.openModal({
            content: (
                <UpdateReasonModal
                    onClose={(reason) => {modal.close(); handleUpdate(reason)}}
                    onDismiss={() => modal.close()}
                />
            )
        })

    }

    saveCustomer() {
        let {bill} = this.state;
        customerApi.createCustomer(pick(bill.customer, ["phone", "name", "address", "receiver_name", "receiver_place", "receiver_phone"])).then((customer) => {
            confirmModal.alert("Lưu thông tin khách hàng thành công");
            this.setState({bill: {...bill, customer: {delivery_time: new Date(), payment_type: "Shop"}}})
        });
    }

    render() {

        let {bill, saving, florists, sales, ships, locations} = this.state;


        let validations = [];

        if (!bill) return null;

        const isCanEditBill = (bill) => {
            if (["Chờ xử lý", "Đang xử lý", "Chờ giao"].indexOf(bill.status) > -1) {
                return security.isHavePermission(["bill.edit"])
            }

            return security.isHavePermission(["bill.editDoneBill"])

        };


        return (
            <Layout
                activeRoute="Hoá Đơn"
                hidden={!isCanEditBill(bill)}
            >
                <div className="bill-route">

                    <div className="row">

                        <div className="col-md-4">
                            <LeftSide
                                items={bill.items}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                            />
                        </div>

                        <div className="col-md-8">
                            <BillView
                                editMode
                                bill={bill}
                                onChangeBill={(bill) => this.setState({bill})}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                            />

                            <Form
                                formValue={bill.customer}
                                validations={validations}
                                render={(getInvalidByKey, invalidPaths) => (
                                    <Fragment>
                                        <BillCustomer
                                            ref={elem => this.billCustomer = elem}
                                            bill={bill}
                                            onChangeBill={(bill) => this.setState({bill})}
                                            onChangeLocations={(locations) => this.setState({locations})}
                                            customer={bill.customer}
                                            onChange={(customer) => {
                                                this.setState({bill: {...bill, customer}})
                                            }}
                                            editMode
                                            infoComponent={() => (
                                                <BillInfo
                                                    bill={bill}
                                                    onChangeBill={(bill) => this.setState({bill})}
                                                    florists={florists}
                                                    sales={sales}
                                                    ships={ships}
                                                    ref={elem => this.billInfo = elem}
                                                    locations={locations}
                                                    deliverTime={bill.deliverTime}
                                                    onChangeDeliverTime={(deliverTime) => this.setState({
                                                        bill: {
                                                            ...bill,
                                                            deliverTime,
                                                            to: {
                                                                ...bill.to,
                                                                shipMoney: this.billInfo.getShipMoney(deliverTime)
                                                            }
                                                        }
                                                    })}
                                                    to={bill.to}
                                                    onChange={(to) => this.setState({bill: {...bill, to}})}
                                                />
                                            )}
                                        />



                                        <div className="text-right btn-action">
                                            <button type="button"
                                                    disabled={
                                                        bill.items.length == 0 ||
                                                        saving ||
                                                        bill.sales.length == 0 ||
                                                        bill.florists.length == 0 ||
                                                        bill.customer.customerName.length == 0 ||
                                                        bill.customer.customerPhone.length == 0 ||
                                                        bill.to.receiverName.length == 0 ||
                                                        bill.to.receiverPhone.length == 0 ||
                                                        bill.to.receiverPlace.length == 0
                                                    }
                                                    className="btn btn-primary" onClick={() => this.submitBill()}>
                                                <span className="btn-text">Cập nhật</span>
                                                { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                            </button>
                                        </div>
                                    </Fragment>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}