import React, {Fragment} from "react";
import { Route, BrowserRouter, Switch} from 'react-router-dom';
import {LoginRoute} from "./login/login-route";
import {BillRoute} from "./bill/bill-route";
import {userInfo} from "../security/user-info";
import {PremisesRoute} from "./premises-route/premises-route";
import {responsive} from "../common/responsive/responsive";
import {ModalsRegistry} from "../components/modal/modals";
import {ManageUserRoute} from "./manage-user-route/manage-user-route";
import {BillReportRoute} from "./report/bill-report";
import {BillEditRoute} from "./bill-edit-route/bill-edit-route";
import {Customers} from "./customers/customers";
export class AppRouter extends React.Component {

    constructor(props) {
        super(props);

        userInfo.onChange(() => {
            this.forceUpdate();
        })

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
            if (user.isAdmin) return comp;
            return redirect("/")
        };

        return (
            <Fragment>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/" component={requireAuthen(BillRoute)} />
                        <Route exact path="/login" component={requireUnauthen(LoginRoute)} />
                        <Route exact path="/manage-premises" component={requireAuthenAdmin(PremisesRoute)} />
                        <Route exact path="/manage-user" component={requireAuthenAdmin(ManageUserRoute)} />
                        <Route exact path="/report" component={requireAuthen(BillReportRoute)} />
                        <Route exact path="/edit-bill/:id" component={requireAuthen(BillEditRoute)} />
                        <Route exact path="/customers" component={requireAuthenAdmin(Customers)} />
                    </Switch>
                </BrowserRouter>
                <ModalsRegistry />
            </Fragment>
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
