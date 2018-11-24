import React, {Fragment} from "react";
import {Form} from "../../components/form/form";
import {minLength, required} from "../../components/form/validations";
import {Input} from "../../components/input/input";
import {GoogleMaps} from "../../components/google-maps/google-maps";
export class ManagePremisesModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.content
    }

    render() {

        let {onClose, onDismiss, content} = this.props;
        let {name, address, phone, location} = this.state;


        let validations = [
            {"name" : [required("Tên Cơ Sở")]},
            {"address": [required("Địa chỉ")]},
        ];

        return (
            <div className="app-modal-box ">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{content._id ? `Sửa cơ sở ${content.name}` : "Thêm cơ sở"}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => location && onClose(this.state)}
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
                                        onChange={(e) => this.setState({address: e.target.value, location: null})}
                                        placeholder="Địa chỉ"
                                        error={getInvalidByKey("address")}
                                        saving={address && !location}
                                    />

                                    <GoogleMaps
                                        location={location}
                                        address={address}
                                        onChange={(location) => this.setState({location})}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-info">Lưu</button>
                                </div>
                            </Fragment>
                        )}
                    />


                </div>
            </div>
        );
    }
}