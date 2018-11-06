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
export class BillEditRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bill: null,
            saving: false
        };

        billApi.getBillById(props.match.params.id).then(({bill, customer}) => {
            this.setState({bill: {...bill, customer: {...customer, ...bill}}})
        })
    }

    submitBill() {

        let {history} = this.props;
        let {bill} = this.state;

        const handleUpdate = (reason) => {
            customerApi.createCustomer(pick(bill.customer, ["phone", "name", "address", "receiver_name", "receiver_place", "receiver_phone"])).then((customer) => {
                billApi.updateBill(bill._id, {
                    ...omit(bill.customer, ["phone", "name", "address", "_id", "_v", "total_pay"]),
                    items: bill.items.map(item => ({...omit(item)})),
                    customer_id: customer._id,
                    reason,
                    update_time: new Date()
                }).then(() => {
                    confirmModal.alert("Cập nhật thành công");
                    history.push("/");
                })
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

        let {bill, saving} = this.state;

        const user = userInfo.getUser();

        let validations = [];

        if (!bill) return null;

        return (
            <Layout
                activeRoute="Hoá Đơn"
            >
                <div className="bill-route">

                    <div className="ct-page-title">
                        <h1 className="ct-title">Sửa hoá đơn</h1>
                    </div>

                    <div className="row">

                        {user.isAdmin && (
                            <div className="col-md-4">
                                <LeftSide
                                    items={bill.items}
                                    onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                                />
                            </div>
                        )}

                        <div className={classnames(user.isAdmin ? "col-md-8" : "col-md-12")}>
                            <BillView
                                items={bill.items}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                                editMode={!user.isAdmin}
                            />

                            <Form
                                formValue={bill.customer}
                                validations={validations}
                                render={(getInvalidByKey, invalidPaths) => (
                                    <Fragment>
                                        <BillCustomer
                                            customer={bill.customer}
                                            onChange={(customer) => {
                                                this.setState({bill: {...bill, customer}})
                                            }}
                                            editMode={!user.isAdmin}
                                        />

                                        <div className="text-right btn-action">
                                            <button type="button" className="btn btn-info"
                                                    onClick={() => this.saveCustomer()}
                                                    disabled={invalidPaths.length > 0}
                                            >Lưu thông tin khách hàng
                                            </button>

                                            <button type="button"
                                                    disabled={saving || invalidPaths.length > 0 || bill.items.length == 0}
                                                    className="btn btn-primary btn-icon" onClick={() => this.submitBill()}>
                                                <span className="btn-inner--text">Cập nhật</span>
                                                { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
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