import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {Checkbox} from "../../components/checkbox/checkbox";
import {required, minLength} from "../../components/form/validations";
import {Form} from "../../components/form/form";
import {security} from "../../security/secuiry-fe";

export class LoginRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            submitting: false,
            error: false
        }
    }

    submit() {
        this.setState({submitting: true, error: false});
        let {username, password} = this.state;
        security.login({username, password}).then(() => {
            this.props.history.push("/");
        }, () => {
            this.setState({error: true, submitting: false})
        })
    }

    render() {

        let {username, password, submitting, error} = this.state;

        let validations = [
            {"username" : [required("Tên Tài Khoản")]},
            {"password": [required("Mật Khẩu"), minLength(6, "Mật Khẩu")]}
        ];

        return (
            <div className="login-route">
                <div className="bg-gradient">
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                </div>

                <div className="container pt-lg-md">
                    <div className="row justify-content-center">
                        <div className="col-lg-5">
                            <div className="card bg-secondary shadow border-0">
                                <div className="card-header bg-white text-center">
                                    Đăng Nhập
                                </div>

                                <div className="card-body px-lg-5 py-lg-5">

                                    { error && (
                                        <div className="error-login">
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
                                                    icon={<i className="ni ni-circle-08" />}
                                                    placeholder="Tên Tài Khoản"
                                                    error={getInvalidByKey("username")}
                                                />

                                                <Input
                                                    value={password}
                                                    onChange={(e) => this.setState({password: e.target.value})}
                                                    icon={<i className="ni ni-lock-circle-open"/>}
                                                    placeholder="Mật Khẩu"
                                                    type="password"
                                                    error={getInvalidByKey("password")}
                                                />

                                                <div className="text-center">
                                                    <button
                                                        disabled={submitting}
                                                        type="submit" className="btn btn-icon btn-3 btn-info">
                                                        <span className="btn-inner--text">Đăng Nhập</span>
                                                        { submitting && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                                    </button>
                                                </div>
                                            </Fragment>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}