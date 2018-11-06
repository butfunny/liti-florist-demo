import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {minLength, required} from "../../components/form/validations";
import {Input} from "../../components/input/input";
export class ManagePremisesModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: props.content.name,
            address: props.content.address,
            phone: props.content.phone,
        }
    }

    render() {

        let {onClose, onDismiss, content} = this.props;
        let {name, address, phone} = this.state;

        let validations = [
            {"name" : [required("Tên Cơ Sở")]},
            {"address": [required("Địa chỉ")]},
            {"phone": [required("Số Điện Thoại")]},
        ];

        return (
            <div className="app-modal-box ">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{content.id ? `Sửa cơ sở ${content.name}` : "Thêm cơ sở"}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => onClose(this.state)}
                        formValue={this.state}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        value={name}
                                        onChange={(e) => this.setState({name: e.target.value})}
                                        placeholder="Tên Cơ Sở"
                                        error={getInvalidByKey("name")}
                                    />

                                    <Input
                                        value={address}
                                        onChange={(e) => this.setState({address: e.target.value})}
                                        placeholder="Địa chỉ"
                                        error={getInvalidByKey("address")}
                                    />

                                    <Input
                                        value={phone}
                                        onChange={(e) => this.setState({phone: e.target.value})}
                                        placeholder="Số Điện Thoại"
                                        error={getInvalidByKey("phone")}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-primary">Lưu</button>
                                </div>
                            </Fragment>
                        )}
                    />


                </div>
            </div>
        );
    }
}