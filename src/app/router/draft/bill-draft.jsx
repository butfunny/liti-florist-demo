import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {LeftSide} from "../bill/left-side/left-side";
import {BillView} from "../bill/bill-view/bill-view";
import {Form} from "../../components/form/form";
import {BillCustomer} from "../bill/customer/bill-customer";
import {BillInfo} from "../bill/bill-info/bill-info";
import {premisesInfo} from "../../security/premises-info";
import {cache} from "../../common/cache";
import {customerApi} from "../../api/customer-api";
import omit from "lodash/omit";
import {billApi} from "../../api/bill-api";
import {formatValue} from "../../common/common";
import {userInfo} from "../../security/user-info";
import {PrintService} from "../../common/print-service/print-service";
import {BillPrint} from "../bill/print/bill-print";
import {securityApi} from "../../api/security-api";
import {promotionApi} from "../../api/promotion-api";
import {security} from "../../security/secuiry-fe";

const initBill = {
    items: [],
    customer: {},
    customerInfo: null,
    to: {
        receiverPhone: "",
        receiverName: "",
        receiverPlace: "",
        cardContent: "",
        notes: "",
        paymentType: "Shop",
        shipMoney: 0
    },
    deliverTime: new Date(),
    sales: [],
    florists: [],
    ships: [],
    payOwe: false
}


export class BillDraft extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            bill: initBill,
            saving: false,
            locations: [],
            sales: [],
            florists: [],
            ships: [],
            activePromotions: [],
            selectedPromotion: null
        };

        billApi.getBillDraftById(props.match.params.id).then(({bill, customer}) => {
            this.setState({bill: {...bill, customer: {...customer, ...bill}}})
        });

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

        promotionApi.get().then((promotions) => {
            let activePromotions = [];
            for (let promotion of promotions) {

                let isHave = new Date(promotion.from).getTime() < new Date().getTime() && new Date().getTime() < new Date(promotion.to).getTime();
                if (isHave) activePromotions.push(promotion)
            }

            this.setState({activePromotions});

            if (activePromotions.length > 0) {
                this.setState({
                    bill: {
                        ...this.state.bill, promotion: {
                            promotion_id: activePromotions[0]._id,
                            name: activePromotions[0].name,
                            discount: activePromotions[0].discount,
                        }
                    }
                })
            }
        });

        premisesInfo.onChange(() => {
            this.setState({
                bill: initBill,
                locations: []
            })
        })
    }

    submitBill(bill) {

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

        const getCustomerID = () => {
            if (!bill.customer._id) {
                return customerApi.createCustomer(bill.customer).then((customer) => {
                    return customer._id
                })
            }

            return customerApi.updateCustomer(bill.customer._id, omit(bill.customer, "_id")).then(() => {
                return bill.customer._id
            });
        };

        getCustomerID().then((customerID) => {
            billApi.getBillNumbers({from: today, to: endDay}).then((bills) => {
                billApi.createBill({
                    ...bill,
                    bill_number: `${formatValue(today.getDate())}${formatValue(today.getMonth() + 1)}${today.getFullYear()}${formatValue((bills.length || 0) + 1)}`,
                    customerId: customerID,
                    premises_id: getCurrentPremise(),
                    status: "Chờ xử lý",
                    created_by: userInfo.getUser().username,
                    created: new Date(),
                    isNewCustomer: !bill.customer._id,
                    isOwe: bill.to.paymentType == "Nợ"
                }).then(() => {

                    PrintService.printBill({
                        body: (
                            <BillPrint
                                bill={{
                                    ...bill,
                                    bill_number: `${formatValue(today.getDate())}${formatValue(today.getMonth() + 1)}${today.getFullYear()}${formatValue(bills.length + 1)}`,
                                    isOwe: bill.to.paymentType == "Nợ",
                                    created_by: userInfo.getUser().username
                                }}
                            />
                        )
                    });

                    billApi.removeBillDraft(this.props.match.params.id);
                    this.props.history.push("/");
                })
            })
        });

    }

    saveDraftBill(bill) {
        this.setState({savingDraft: true});
        billApi.updateBillDraft(bill._id, bill).then(() => {
            this.props.history.push("/draft")
        })
    }


    render() {

        let {bill, saving, locations, florists, sales, ships, savingDraft, activePromotions, selectedPromotion} = this.state;

        return (
            <Layout
                activeRoute="Hoá Đơn"
                hidden={!security.isHavePermission(["bill.edit"])}

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
                                activePromotions={activePromotions}
                                bill={bill}
                                onChangeBill={(bill) => this.setState({bill})}
                                onChangeItems={(items) => this.setState({bill: {...bill, items}})}
                            />

                            <Form
                                formValue={bill.customer}
                                validations={[]}
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
                                            <button type="button" className="btn btn-link"
                                                    style={{
                                                        marginRight: "5px"
                                                    }}
                                                    onClick={() => this.saveDraftBill(bill)}
                                                    disabled={bill.items.length == 0 || savingDraft}
                                            >Cập nhật đơn sẵn {savingDraft && <span className="btn-inner--icon"><i
                                                className="fa fa-spinner fa-pulse"/></span>}
                                            </button>

                                            <button type="button"
                                                    disabled={
                                                        bill.items.length == 0 ||
                                                        saving ||
                                                        !bill.customer ||
                                                        bill.customer.customerName.length == 0 ||
                                                        bill.customer.customerPhone.length == 0 ||
                                                        bill.to.receiverName.length == 0 ||
                                                        bill.to.receiverPhone.length == 0 ||
                                                        bill.to.receiverPlace.length == 0
                                                    }
                                                    className="btn btn-primary btn-icon"
                                                    onClick={() => this.submitBill(bill)}>
                                                <span className="btn-text">Bán Hàng</span>
                                                {saving && <span className="loading-icon"><i
                                                    className="fa fa-spinner fa-pulse"/></span>}
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