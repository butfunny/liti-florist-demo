import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {LeftSide} from "./left-side/left-side";
import {BillView} from "./bill-view/bill-view";
import {BillCustomer} from "./customer/bill-customer";
import {billApi} from "../../api/bill-api";
import {customerApi} from "../../api/customer-api";
import pick from "lodash/pick";
import omit from "lodash/omit";
import {formatValue} from "../../common/common";
import {premisesInfo} from "../../security/premises-info";
import {Form} from "../../components/form/form";
import {minLength, required} from "../../components/form/validations";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {PrintService} from "../../common/print-service/print-service";
import {BillPrint} from "./print/bill-print";
import {cache} from "../../common/cache";
import {BillInfo} from "./bill-info/bill-info";
export class BillRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bill: {
                items: [],
                customer: {
                },
                to: {
                    receiverPhone: "",
                    receiverName: "",
                    receiverPlace: "",
                    cardContent: "",
                    notes: "",
                    paymentType: "",
                    shipMoney: 0
                },
                payment_type: "Shop",
                deliverTime: new Date()
            },
            saving: false,
            locations: []
        };
    }

    submitBill() {

        let {bill} = this.state;
        this.setState({saving: true});

        let premises = premisesInfo.getPremises();

        const getCurrentPremise = () => {
            const activeID = cache.get("active-premises");
            if (!activeID) {
                cache.set(premises[0]._id, "active-premises");
                return premises[0]._id;
            }
            const found = premises.find(p => p._id == activeID);
            if (found) return found._id;
            else {
                cache.set(premises[0]._id, "active-premises");
                return premises[0]._id
            }
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        customerApi.createCustomer(pick(bill.customer, ["phone", "name", "address", "receiver_name", "receiver_place", "receiver_phone"])).then((customer) => {
            billApi.getAllBills({from: today, to: endDay}).then((bills) => {
                billApi.createBill({
                    items: bill.items,
                    created: new Date(),
                    ...omit(bill.customer, ["phone", "name", "address", "_id", "_v", "total_pay"]),
                    bill_id: `${formatValue(today.getDate())}${formatValue(today.getMonth() + 1)}${today.getFullYear()}${formatValue(bills.length + 1)}`,
                    customer_id: customer._id,
                    premises_id: getCurrentPremise(),
                    status: "pending",
                }).then((bill) => {
                    this.setState({saving: false, bill: {items: [], customer: {delivery_time: new Date(), payment_type: "Shop"}}});
                    PrintService.printBill({
                        body: (
                            <BillPrint
                                bill={{...bill, ...bill.customer, customer}}
                            />
                        )
                    })

                })
            });
        });

    }

    saveCustomer() {
        let {bill} = this.state;
        customerApi.createCustomer(pick(bill.customer, ["phone", "name", "address", "receiver_name", "receiver_place", "receiver_phone"])).then((customer) => {
            confirmModal.alert("Lưu thông tin khách hàng thành công");
            this.setState({bill: {...bill, customer: {delivery_time: new Date(), payment_type: "Shop"}}})
        });
    }

    render() {

        let {bill, saving, locations} = this.state;

        return (
            <Layout
                activeRoute="Hoá Đơn"
            >
                <div className="bill-route">

                    <div className="ct-page-title">
                        <h1 className="ct-title">Hoá Đơn Bán Hàng</h1>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <LeftSide
                                items={bill.items}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                            />
                        </div>

                        <div className="col-md-8">
                            <BillView
                                items={bill.items}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                            />

                           <Form
                               formValue={bill.customer}
                               validations={[]}
                               render={(getInvalidByKey, invalidPaths) => (
                                    <Fragment>
                                        <BillCustomer
                                            onChangeLocations={(locations) => this.setState({locations})}
                                            customer={bill.customer}
                                            onChange={(customer) => {
                                                this.setState({bill: {...bill, customer}})
                                            }}
                                        />

                                        <BillInfo
                                            locations={locations}
                                            deliverTime={bill.deliverTime}
                                            onChangeDeliverTime={(deliverTime) => this.setState({bill: {...bill, deliverTime}})}
                                            to={bill.to}
                                            onChange={(to) => this.setState({bill: {...bill, to}})}
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
                                                <span className="btn-inner--text">Bán Hàng</span>
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