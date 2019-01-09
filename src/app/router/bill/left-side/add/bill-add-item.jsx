import React, {Fragment} from "react";
import {Input} from "../../../../components/input/input";
import {InputNumber} from "../../../../components/input-number/input-number";
import {Form} from "../../../../components/form/form";
import {minLength, required} from "../../../../components/form/validations";
import {AutoCompleteNormal} from "../../../../components/auto-complete/auto-complete-normal";
import {productApi} from "../../../../api/product-api";
import uniq from "lodash/uniq";
import {permissionInfo} from "../../../../security/premises-info";
import {userInfo} from "../../../../security/user-info";
import {InputTag} from "../../../../components/input-tag/input-tag";
import {InputTag2} from "../../../../components/input-tag/input-tag-2";
import {Select} from "../../../../components/select/select";
import {SelectTagsColor} from "../../../../components/select-tags-color/select-tags-color";
import {SelectTags} from "../../../../components/select-tags/select-tags";

export class BillAddItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            price: "",
            name: "",
            type: "",
            color: [],
            size: ""
        };


    }


    render() {

        let {price, name, type, color, size} = this.state;
        let {onChangeItem, onChangeCatalog, saving, types, colors} = this.props;

        let sizes = ["XS", "S", "M", "L", "XL", "XXL"];

        let validations = [
            {"type" : [required("Loại")]},
            {"color" : [required("Màu")]},
            {"price" : [required("Giá")]},
            {"name": [required("Chi tiết")]},
            {"size": [required("Size")]},
        ];


        return (
            <div className="card bill-add-item">
                <div className="card-title">
                    Thêm sản phẩm
                </div>

                <Form
                    onSubmit={() => {
                        onChangeItem({price, name, type, color: color.join(", "), size});
                        this.setState({price: "", name: "", type: "", color: [], size: ""});
                    }}
                    formValue={this.state}
                    validations={validations}
                    render={(getInvalidPath, invalidPaths) => (
                        <div className="card-body">

                            <Select
                                label="Loại*"
                                list={types}
                                value={type}
                                onChange={(type) => this.setState({type})}
                            />

                            <Select
                                label="Size*"
                                list={sizes}
                                value={size}
                                onChange={(size) => this.setState({size})}
                            />

                            <SelectTagsColor
                                label="Màu*"
                                tags={color}
                                onChange={(color) => this.setState({color})}
                            />


                            <Input
                                label="Miêu tả*"
                                value={name}
                                onChange={(e) => this.setState({name: e.target.value})}
                            />

                            <InputNumber
                                label="Giá*"
                                value={price}
                                onChange={(price) => this.setState({price})}
                            />


                            <div className="row">
                                <button type="submit"
                                        style={{marginRight: "10px"}}
                                        className="btn btn-primary"
                                        disabled={invalidPaths.length > 0}>
                                    Thêm
                                </button>


                                <button className="btn btn-primary"
                                        onClick={() => {
                                            onChangeCatalog({price, name, type, size, color: color.join(", ")});
                                            this.setState({price: "", name: "", type: "", color: [], size: ""});
                                        }}
                                        disabled={invalidPaths.length > 0 || saving}>
                                    <span className="btn-text">Thêm danh mục</span>
                                    { saving && <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                </button>
                            </div>

                        </div>
                    )}
                />
            </div>
        );
    }
}