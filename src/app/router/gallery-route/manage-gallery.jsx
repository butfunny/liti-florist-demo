import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {roles} from "../../common/constance";
import {Form} from "../../components/form/form";
import {productApi} from "../../api/product-api";
import {InputTag2} from "../../components/input-tag/input-tag-2";
import {minVal, required} from "../../components/form/validations";
import {formatNumber, resizeImage} from "../../common/common";
import {uploadApi} from "../../api/upload-api";
import {billApi} from "../../api/bill-api";
import {Select} from "../../components/select/select";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {PictureUpload} from "../../components/picture-upload/picture-upload";
import {flowersApi} from "../../api/flowers-api";
import {AutoComplete} from "../../components/auto-complete/auto-complete";
import {DataTable} from "../../components/data-table/data-table";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {InputQuantity} from "../../components/input-quantity/input-quantity";
import {InputNumber} from "../../components/input-number/input-number";
import {formValidator} from "../../components/form/form-validator";

export class ManageGallery extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photo: props.photo,
            types: [],
            catalogs: []
        };


        productApi.getTypes().then((types) => {
            this.setState({types: types})
        });

    }

    handleSelectProduct(product) {
        let items = [...this.state.photo.items];
        let itemFound = items.find(i => i.parentID == product._id);
        if (itemFound) itemFound.quantity++;
        else items.push({parentID: product._id, quantity: 1, ...product});

        this.setState({
            productID: "",
            photo: {
                ...this.state.photo,
                items
            }
        })
    }

    handleChangeQuantity(row, quantity) {
        let items = [...this.state.photo.items];
        let itemFound = items.find(i => i.parentID == row.parentID);

        if (quantity === 0) {
            items = items.filter(i => i != itemFound);
        } else {
            itemFound.quantity = quantity;
        }

        this.setState({
            photo: {
                ...this.state.photo,
                items
            }
        })
    }

    handleRemoveItem(row) {
        this.setState({
            photo: {
                ...this.state.photo,
                items: this.state.photo.items.filter(i => i.parentID != row.parentID)
            }
        })
    }


    render() {

        let {onDismiss, onClose} = this.props;
        let {photo, types, colors, saving, uploading} = this.state;

        let validations = [
            {"title" : [required("Tên")]},
            {"flowerType" : [required("Loại")]},
            {"colors" : [required("Màu")]},
            {"url" : [required("Ảnh")]}
        ];

        let columns = [{
            label: "Thông Tin SP",
            width: "80%",
            display: (row) => (
                <ColumnViewMore
                    header={
                        <div className="product-name">
                            <ImgPreview src={row.image}/> {row.name}
                        </div>
                    }
                    renderViewMoreBody={() => (
                        <Fragment>
                            <div className="info-item">
                                Màu:
                                {row.colors.map((color, index) => (
                                    <div key={index}
                                         style={{
                                             background: color,
                                             height: "15px",
                                             width: "25px",
                                             display: "inline-block",
                                             marginLeft: "5px"
                                         }}
                                    />
                                ))}
                            </div>

                            <div className="info-item">
                                Đơn Vị Tính: {row.unit}
                            </div>

                            { row.lengthiness && (
                                <div className="info-item">
                                    Chiều Dài Cành Hoa: {row.lengthiness}
                                </div>
                            )}
                        </Fragment>
                    )}
                    viewMoreText="Chi Tiết"
                    subText={<div>{row.productID} - {row.catalog}</div>}
                    isShowViewMoreText
                />
            ),
            minWidth: "200",
            sortBy: (row) => row.name
        }, {
            label: "Số Lượng",
            width: "15%",
            display: (row) => (
                <InputQuantity
                    value={row.quantity}
                    onChange={(quantity) => this.handleChangeQuantity(row, quantity)}
                />
            ),
            className: "number content-menu-action",
            minWidth: "150",
            sortBy: (row) => row.quantity
        }, {
            label: "",
            width: "5%",
            display: (row) => <button onClick={() => this.handleRemoveItem(row)} className="btn btn-small btn-danger btn-remove"><i className="fa fa-trash" aria-hidden="true"/></button>,
            className: "number content-menu-action",
            minWidth: "50",
        }];



        let isValidForm = formValidator.getInvalidPaths(photo, validations);

        return (
            <div className="manage-gallery-modal app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{photo._id ? "Sửa" : "Thêm"} ảnh</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <Form
                        ref={elem => this.form = elem}
                        onSubmit={() => {

                        }}
                        formValue={photo}
                        validations={validations}
                        render={(getInvalidByKey, invalidPaths) => {
                            return (
                                <Fragment>
                                    <div className="modal-body">
                                        <Input
                                            label="Tên hoa*"
                                            value={photo.title}
                                            onChange={(e) => this.setState({photo: {...photo, title: e.target.value}})}
                                            error={getInvalidByKey("title")}
                                        />

                                        <Select
                                            list={types.map(t => t.name)}
                                            value={photo.flowerType}
                                            onChange={(value) => this.setState({photo: {...photo, flowerType: value}})}
                                            label="Loại*"
                                            error={getInvalidByKey("flowerType")}
                                        />

                                        <SelectTagsColor
                                            tags={photo.colors}
                                            onChange={(c) => this.setState({photo: {...photo, colors: c}})}
                                            error={getInvalidByKey("colors")}
                                            label="Màu"
                                        />

                                        <PictureUpload
                                            label="Ảnh Hoa"
                                            value={photo.url}
                                            onChange={(image) => this.setState({photo: {...photo, url: image}})}
                                            error={getInvalidByKey("url")}
                                        />

                                        <AutoComplete
                                            asyncGet={(name) => {
                                                if (name.length > 0) {
                                                    return flowersApi.getFlowers({keyword: name, skip: 0}).then((resp) => resp.flowers)
                                                }
                                                return Promise.resolve([])
                                            }}
                                            onSelect={(product) => this.handleSelectProduct(product)}
                                            objectKey="productID"
                                            object={this.state}
                                            onChange={(value) => this.setState({productID: value})}
                                            displayAs={(product) => <span>{product.productID} - <b>{product.name}</b> - {product.catalog}</span>}
                                            noPopup
                                            label="Tên/Mã Sản Phẩm"
                                        />

                                    </div>
                                </Fragment>
                            )
                        }}

                    />

                    <DataTable
                        columns={columns}
                        rows={photo.items}
                    />

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                        <button type="submit"
                                disabled={!isValidForm || photo.items.length == 0 }
                                onClick={() => {
                                    this.setState({saving: true});
                                    onClose(photo);
                                }}
                                className="btn btn-primary">
                            <span className="btn-inner--text">Lưu</span>
                            { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}