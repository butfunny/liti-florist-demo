import React, {Fragment} from "react";
import {Form} from "../../../../components/form/form";
import {Input} from "../../../../components/input/input";
import {isNumber, required} from "../../../../components/form/validations";
import {InputNumber} from "../../../../components/input-number/input-number";
import {productApi} from "../../../../api/product-api";
export class EditCatalogModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            catalog: props.catalog,
            saving: false
        }
    }

    submit() {
        let {catalog} = this.state;
        this.setState({saving: true});
        productApi.update(catalog._id, {
            name: catalog.name,
            price: catalog.price
        }).then(() => {
            this.props.onClose(catalog);
        })
    }

    render() {

        let {catalog, onDismiss} = this.props;

        let validations = [
            {"price" : [required("Giá")]},
            {"name": [required("Tên sản phẩm")]}
        ];

        let {saving} = this.state;
        let {name, price} = this.state.catalog;

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sửa {catalog.name}</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        onSubmit={() => this.submit()}
                        formValue={this.state.catalog}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">

                                    <Input
                                        placeholder="Tên sản phẩm"
                                        value={name}
                                        onChange={(e) => this.setState({catalog: {...this.state.catalog, name: e.target.value}})}
                                        error={getInvalidByKey("name")}
                                    />

                                    <InputNumber
                                        placeholder="Giá"
                                        value={price}
                                        onChange={(price) => this.setState({catalog: {...this.state.catalog, price}})}
                                        error={getInvalidByKey("price")}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit"
                                            disabled={saving}
                                            className="btn btn-primary btn-icon">
                                        <span className="btn-inner--text">Cập Nhật</span>
                                        { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
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