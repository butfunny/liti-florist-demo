import React from "react";
import {minVal, required} from "../../components/form/validations";
import {Input} from "../../components/input/input";
import {Select} from "../../components/select/select";
import {catalogs} from "../../common/constance";
import {PictureUpload} from "../../components/picture-upload/picture-upload";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {InputNumber} from "../../components/input-number/input-number";
import {Form} from "../../components/form/form";
import {warehouseApi} from "../../api/warehouse-api";
export class ManagePriceModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: props.product
        }
    }

    submit() {
        let {isSubWarehouse, onClose} = this.props;
        let {product} = this.state;
        warehouseApi.updateWarehousePrice(product._id, {
            isSubWarehouse,
            ...product
        }).then(() => {
            onClose(product)
        })
    }

    render() {

        let {onDismiss} = this.props;
        let {saving, product} = this.state;

        let validations = [
            {"oriPrice": [minVal("Gía Gốc", 0), required("Giá Gốc")]},
            {"price": [minVal("Giá Gốc", 0), required("Giá Bán")]},
        ];

        return (
            <div className="modal app-modal-box">

                <Form
                    onSubmit={() => this.submit()}
                    formValue={product}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <div className="modal-content">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Cập nhật giá {this.props.product.name}</h5>
                                    <button type="button" className="close" onClick={() => onDismiss()}>
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                            </div>

                            <div className="modal-body">

                                <InputNumber
                                    label="Giá Gốc"
                                    value={product.oriPrice}
                                    onChange={(oriPrice) => this.setState({product: {...product, oriPrice}})}
                                    error={getInvalidByKey("oriPrice")}
                                />

                                <InputNumber
                                    label="Giá Bán"
                                    value={product.price}
                                    onChange={(price) => this.setState({product: {...product, price}})}
                                    error={getInvalidByKey("price")}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                <button type="submit"
                                        className="btn btn-primary">
                                    <span className="btn-text">Cập Nhật</span>
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