import React, {Fragment} from "react";
import { Route, BrowserRouter, Switch} from 'react-router-dom';
import {LoginRoute} from "./login/login-route";
import {BillRoute} from "./bill/bill-route";
import {userInfo} from "../security/user-info";
import {PremisesRoute} from "./premises-route/premises-route";
import {responsive} from "../common/responsive/responsive";
import {ModalsRegistry} from "../components/modal/modals";
import {ManageUserRoute} from "./manage-user-route/manage-user-route";
import {BillOrderRoute} from "./order/bill-order";
import {BillEditRoute} from "./bill-edit-route/bill-edit-route";
import {Customers} from "./customers/customers";
import {VipRoute} from "./vip/vip-route";
import {WarehouseRoute} from "./warehouse/warehouse-route";
import {PromotionRoute} from "./promotion/promotion-route";
import {FloristRoute} from "./florist-route/florist-route";
import {FloristWorkingRoute} from "./florist-working-route/florist-working-route";
import {ShipRoute} from "./ship-route/ship-route";
import {MySalaryRoute} from "./salary-route/my-salary-route";
import {OrderDraft} from "./draft/order-draft";
import {BillDraft} from "./draft/bill-draft";
import {RequestWareHouse} from "./warehouse/request-warehouse/request-warehouse";
import {ListRequestWarehouse} from "./warehouse/list-request/list-request-warehouse";
import {RevenueReportRoute} from "./report/revenue/revenue-report-route";
import {ReportCustomerRoute} from "./report/customer/report-customer-route";
import {ReportDiscountRoute} from "./report/discount/report-discount-route";
import {ReportBillRoute} from "./report/bill/report-bill-route";
import {GalleryRoute} from "./gallery-route/gallery-route";
import {ManageRole} from "./manage-role/manage-role";
import {CreateRequestMissing} from "./request-missing/create-request-missing";
import {ListRequestMissing} from "./request-missing/list-request-missing";
import {SettingRoute} from "./setting/setting-route";
import {SupplierRoute} from "./supplier/supplier-route";
import {ProductsRoute} from "./products/products-route";
export class AppRouter extends React.Component {

    constructor(props) {
        super(props);

        userInfo.onChange(() => {
            this.forceUpdate();
        });

        responsive.onChange(() => {
            this.forceUpdate();
        })
    }

    render() {

        let user = userInfo.getUser();
        const requireAuthen = (comp) => user == null ? redirect("/login") : comp;
        const requireUnauthen = (comp) => user != null ? redirect("/") : comp;
        const requireAuthenAdmin = (comp) => {
            if (user == null) return redirect("/login");
            if (user.role === "admin") return comp;
            return redirect("/")
        };

        return (
            <BrowserRouter>
                <Fragment>
                    <Route exact path="/" component={requireAuthen(BillRoute)} />
                    <Route exact path="/login" component={requireUnauthen(LoginRoute)} />
                    <Route exact path="/manage-premises" component={requireAuthenAdmin(PremisesRoute)} />
                    <Route exact path="/manage-user" component={requireAuthenAdmin(ManageUserRoute)} />
                    <Route exact path="/orders" component={requireAuthen(BillOrderRoute)} />
                    <Route exact path="/edit-bill/:id" component={requireAuthen(BillEditRoute)} />
                    <Route exact path="/customers" component={requireAuthen(Customers)} />
                    <Route exact path="/vip" component={requireAuthen(VipRoute)} />
                    <Route exact path="/warehouse" component={requireAuthen(WarehouseRoute)} />
                    <Route exact path="/promotion" component={requireAuthen(PromotionRoute)} />
                    <Route exact path="/florist" component={requireAuthen(FloristRoute)} />
                    <Route exact path="/ship" component={requireAuthen(ShipRoute)} />
                    <Route exact path="/florist-working/:id" component={requireAuthen(FloristWorkingRoute)} />
                    <Route exact path="/salary" component={requireAuthen(MySalaryRoute)} />
                    <Route exact path="/draft" component={requireAuthen(OrderDraft)} />
                    <Route exact path="/edit-bill-draft/:id" component={requireAuthen(BillDraft)} />
                    <Route exact path="/request-item" component={requireAuthen(RequestWareHouse)} />
                    <Route exact path="/report-revenue" component={requireAuthen(RevenueReportRoute)} />
                    <Route exact path="/report-customer" component={requireAuthen(ReportCustomerRoute)} />
                    <Route exact path="/report-discount" component={requireAuthen(ReportDiscountRoute)} />
                    <Route exact path="/report-bill" component={requireAuthen(ReportBillRoute)} />
                    <Route exact path="/gallery" component={requireAuthen(GalleryRoute)} />
                    <Route exact path="/manage-role" component={requireAuthenAdmin(ManageRole)} />
                    <Route exact path="/list-request-item" component={requireAuthen(ListRequestWarehouse)} />
                    <Route exact path="/create-request-missing" component={requireAuthen(CreateRequestMissing)} />
                    <Route exact path="/list-request-missing" component={requireAuthen(ListRequestMissing)} />
                    <Route exact path="/setting" component={requireAuthen(SettingRoute)} />
                    <Route exact path="/manage-supplier" component={requireAuthen(SupplierRoute)} />
                    <Route exact path="/products" component={requireAuthen(ProductsRoute)} />
                    <ModalsRegistry />
                </Fragment>
            </BrowserRouter>
        );
    }
}

function redirect(location) {
    return class RedirectRoute extends React.Component {
        constructor(props, context) {
            super(props, context);
            props.history.push(location);
        }
        render() {
            return null;
        }
    }
}
