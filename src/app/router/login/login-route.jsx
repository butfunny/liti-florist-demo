import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {Checkbox} from "../../components/checkbox/checkbox";
import {required, minLength} from "../../components/form/validations";
import {Form} from "../../components/form/form";
import {security} from "../../security/secuiry-fe";
import {userInfo} from "../../security/user-info";
import {cache} from "../../common/cache"

export class LoginRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            submitting: false,
            error: false

        };



        cache.set(null, "active-premises");
    }

    submit() {
        this.setState({submitting: true, error: false});
        let {username, password} = this.state;
        security.login({username, password}).then(() => {
            const user = userInfo.getUser();
            let defaultRoute = security.getDefaultRoute(user);
            this.props.history.push(defaultRoute ? defaultRoute : "/");
        }, () => {
            this.setState({error: true, submitting: false})
        })
    }

    render() {

        let {username, password, submitting, error} = this.state;

        let validations = [
            {"username": [required("Tên tài khoản")]},
            {"password": [required("Mật khẩu"), minLength(6, "Mật Khẩu")]}
        ];

        return (
          <div className="login-route">

              <div className="card-login">
                  <div className="card-header">
                      <b>Đăng Nhập</b>
                  </div>

                  {error && (
                    <div className="error-login text-danger">
                        Sai tài khoản hoặc mật khẩu
                    </div>
                  )}

                  <Form
                    onSubmit={() => this.submit()}
                    formValue={this.state}
                    validations={validations}
                    render={(getInvalidByKey) => (
                      <Fragment>
                          <Input
                            value={username}
                            onChange={(e) => this.setState({username: e.target.value})}
                            label="Tên Tài Khoản"
                            error={getInvalidByKey("username")}
                          />

                          <Input
                            value={password}
                            onChange={(e) => this.setState({password: e.target.value})}
                            label="Mật Khẩu"
                            type="password"
                            error={getInvalidByKey("password")}
                          />

                          <div className="text-center">
                              <button
                                disabled={submitting}
                                type="submit" className="btn btn-primary">
                                    <span className="btn-text">
                                        Đăng Nhập
                                    </span>

                                  {submitting && (
                                    <span className="loading-icon">
                                         <i className="fa fa-spinner fa-pulse"/>
                                      </span>
                                  )}

                              </button>
                          </div>
                      </Fragment>
                    )}
                  />
              </div>
          </div>
        );
    }
}