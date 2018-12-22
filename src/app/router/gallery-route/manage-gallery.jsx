import React, {Fragment} from "react";
import {Input} from "../../components/input/input";
import {roles} from "../../common/constance";
import {Form} from "../../components/form/form";
import {productApi} from "../../api/product-api";
import {InputTag2} from "../../components/input-tag/input-tag-2";
import {minVal, required} from "../../components/form/validations";
import {resizeImage} from "../../common/common";
import {uploadApi} from "../../api/upload-api";
import {billApi} from "../../api/bill-api";

export class ManageGallery extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photo: props.photo,
            types: [],
            colors: [],
            catalogs: []
        };

        productApi.getTypes().then((types) => {
            this.setState({types: types})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: colors})
        });


    }

    handleChange(e) {
        if (e.target.files[0]) {
            resizeImage(e.target.files[0]).then((file) => {
                this.setState({uploading: true});
                uploadApi.upload(file).then(resp => {
                    this.setState({uploading: false});
                    let {photo} = this.state;
                    this.setState({photo: {...photo, url: resp.file}})
                })
            })
        }
    }

    render() {

        let {onDismiss, onClose} = this.props;
        let {photo, types, colors, saving, uploading} = this.state;

        let validations = [
            {"title" : [required("Tên")]},
            {"flowerType" : [required("Màu")]},
            {"url" : [required("Màu")]},
            {"note" : [required("Màu")]},
        ];

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
                        onSubmit={() => {
                            this.setState({saving: true});
                            onClose(photo);
                        }}
                        formValue={photo}
                        validations={validations}
                        render={(a, invalidPaths) => {
                            return (
                                <Fragment>
                                    <div className="modal-body">
                                        <Input
                                            value={photo.title}
                                            onChange={(e) => this.setState({photo: {...photo, title: e.target.value}})}
                                            placeholder="Tên hoa"
                                        />

                                        <div className="form-group">
                                            <select className="form-control"
                                                    style={{
                                                        marginBottom: "5px",
                                                        color: "black"
                                                    }}
                                                    value={photo.flowerType} onChange={(e) => this.setState({photo: {...photo, flowerType: e.target.value}})}>
                                                <option value="" disabled>Loại*</option>
                                                { types.map((t, index) => (
                                                    <option value={t.name} key={index}>
                                                        {t.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <InputTag2
                                                tags={photo.colors}
                                                onChange={(c) => this.setState({photo: {...photo, colors: c}})}
                                                list={colors.map(c => c.name)}
                                            />
                                        </div>

                                        <div className="form-group">
                                        <textarea
                                            style={{resize: "none"}}
                                            placeholder="Định Lượng"
                                            value={photo.note}
                                            onChange={(e) => this.setState({photo: {...photo, note: e.target.value}})}
                                            className="form-control">
                                        </textarea>
                                        </div>

                                        <div className="form-group">
                                            <button type="button" className="btn btn-info btn-icon" onClick={() => this.inputUpload.click()}>
                                                <span className="btn-inner--text">Tải ảnh</span>
                                                { uploading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                            </button>

                                            <input
                                                style={{
                                                    display: "none"
                                                }}
                                                className="input-upload"
                                                ref={elem => this.inputUpload = elem}
                                                type="file"
                                                onChange={(e) => this.handleChange(e)}
                                            />

                                            { photo.url && (
                                                <img
                                                    style={{
                                                        width: "100%"
                                                    }}
                                                    src={photo.url} alt=""/>
                                            )}
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                        <button type="submit"
                                                disabled={invalidPaths.length > 0 || photo.colors.length == 0}
                                                className="btn btn-info btn-icon">
                                            <span className="btn-inner--text">Lưu</span>
                                            { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                        </button>
                                    </div>
                                </Fragment>
                            )
                        }}
                    />
                </div>
            </div>
        );
    }
}