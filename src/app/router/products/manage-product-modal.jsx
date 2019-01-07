import React from "react";
import {InputGroup} from "../../components/input/input-group";
import {Select} from "../../components/select/select";
import {Input} from "../../components/input/input";
import {InputTag2} from "../../components/input-tag/input-tag-2";
import {premisesInfo} from "../../security/premises-info";
import {catalogs, viaTypes} from "../../common/constance";
import {DatePicker} from "../../components/date-picker/date-picker";
import {Form} from "../../components/form/form";
import {minVal, required} from "../../components/form/validations";
import {PictureUpload} from "../../components/picture-upload/picture-upload";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
export class ManageProductModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: props.product
        }
    }

    render() {


        let validations = [
            {"productID": [required("Mã Sản Phẩm")]},
            {"name": [required("Tên")]},
            {"image": [required("Ảnh Sản Phẩm")]},
            {"colors": [required("Màu")]},
            {"oriPrice": [minVal(0), required("Giá Gốc")]},
            {"price": [minVal(0), required("Giá Bán")]},
        ];

        let {product, saving} = this.state;
        let {onDismiss} = this.props;


        return (
            <div className="manage-product-modal app-modal-box">
                <Form
                    onSubmit={() => this.submit()}
                    formValue={product}
                    validations={validations}
                    render={(getInvalidByKey) => (
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{product._id ? "Sửa" : "Thêm"} sản phẩm</h5>
                                <button type="button" className="close" onClick={() => onDismiss()}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>

                            <div className="modal-body">

                                <Input
                                    label="Mã Sản Phẩm"
                                    value={product.productID}
                                    onChange={(e) => this.setState({product: {...product, productID: e.target.value}})}
                                    error={getInvalidByKey("productID")}
                                />


                                <Input
                                    label="Tên Sản Phẩm"
                                    value={product.name}
                                    onChange={(e) => this.setState({product: {...product, name: e.target.value}})}
                                    error={getInvalidByKey("name")}
                                />

                                <Select
                                    label="Loại"
                                    value={product.catalog}
                                    onChange={(val) => this.setState({product: {...product, catalog: val}})}
                                    list={catalogs}
                                />

                                <PictureUpload
                                    label="Ảnh Sản Phẩm"
                                    value={product.image}
                                    onChange={(image) => this.setState({product: {...product, image}})}
                                    error={getInvalidByKey("image")}
                                />

                                <SelectTagsColor
                                    label="Màu"
                                    tags={product.colors || []}
                                    onChange={(colors) => this.setState({product: {...product, colors}})}
                                    error={getInvalidByKey("colors")}
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