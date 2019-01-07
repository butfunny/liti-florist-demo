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
import {InputNumber} from "../../components/input-number/input-number";
import {flowersApi} from "../../api/flowers-api";
import readXlsxFile from "read-excel-file";
import isEqual from "lodash/isEqual";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {warehouseApi} from "../../api/warehouse-api";
export class ManageProductModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: props.product,
            error: false
        }
    }

    submit() {
       let {product} = this.props;
       if (!product._id) {
           this.setState({saving: true});
           flowersApi.createFlower(this.state.product).then((resp) => {
               if (resp.error) {
                   this.setState({error: true, saving: false});
               } else {
                   this.props.onClose();
               }
           })
       } else {
           this.setState({saving: true});
           flowersApi.updateFlower(product._id, this.state.product).then((resp) => {
               if (resp.error) {
                   this.setState({error: true, saving: false});
               } else {
                   this.props.onClose();
               }
           })
       }
    }

    render() {

        let validations = [
            {"productID": [required("Mã Sản Phẩm")]},
            {"name": [required("Tên")]},
            {"image": [required("Ảnh Sản Phẩm")]},
            {"colors": [required("Màu")]},
            {"oriPrice": [minVal("Gía Gốc", 0), required("Giá Gốc")]},
            {"price": [minVal("Giá Gốc", 0), required("Giá Bán")]},
            {"unit": [required("Đơn Vị Tính")]},
        ];

        let {product, saving, error} = this.state;
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
                                    onChange={(e) => this.setState({product: {...product, productID: e.target.value}, error: false})}
                                    error={error ? "Mã trùng" : getInvalidByKey("productID")}
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

                                <InputNumber
                                    label="Chiều Dài Cành Hoa"
                                    value={product.lengthiness}
                                    onChange={(lengthiness) => this.setState({product: {...product, lengthiness}})}
                                />

                                <Input
                                    label="Đơn Vị Tính"
                                    value={product.unit}
                                    onChange={(e) => this.setState({product: {...product, unit: e.target.value}})}
                                    error={getInvalidByKey("unit")}
                                />

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