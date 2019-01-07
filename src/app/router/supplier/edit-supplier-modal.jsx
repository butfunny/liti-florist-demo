import React from "react";
import {minVal, required} from "../../components/form/validations";
import {Input} from "../../components/input/input";
import {Select} from "../../components/select/select";
import {catalogs} from "../../common/constance";
import {PictureUpload} from "../../components/picture-upload/picture-upload";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {InputNumber} from "../../components/input-number/input-number";
import {Form} from "../../components/form/form";
import {productApi} from "../../api/product-api";
export class EditSupplierModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            supplier: props.supplier
        }
    }

    submit() {
        let {supplier} = this.state;
        this.setState({saving: true})
        productApi.updateSupplier(supplier._id, supplier).then((resp) => {
            if (resp.error) this.setState({error: true, saving: false});
            else {
                this.props.onClose(supplier);
            }
        })
    }

    render() {

        let validations = [
            {"name": [required("Tên Nhà Cung Cấp")]},
        ];

        let {supplier, saving, error, product} = this.state;
        let {onDismiss} = this.props;

        return (
            <div className="app-modal-box">
                <Form
                    onSubmit={() => this.submit()}
                    formValue={supplier}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sửa Nhà Cung Cấp</h5>
                                <button type="button" className="close" onClick={() => onDismiss()}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>

                            <div className="modal-body">

                                <Input
                                    label="Tên Nhà Cung Cấp"
                                    value={supplier.name}
                                    onChange={(e) => this.setState({supplier: {...supplier, name: e.target.value}, error: false})}
                                    error={error ? "Tên trùng" : getInvalidByKey("name")}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit"
                                        className="btn btn-primary">
                                    <span className="btn-text">Lưu</span>
                                    {saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>
        );
    }
}