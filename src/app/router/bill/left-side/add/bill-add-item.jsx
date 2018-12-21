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
            <Form
                onSubmit={() => {
                    onChangeItem({price, name, type, color: color.join(", "), size});
                    this.setState({price: "", name: "", type: "", color: [], size: ""});
                }}
                formValue={this.state}
                validations={validations}
                className="bill-add-item"
                render={(getInvalidPath, invalidPaths) => (
                    <Fragment>
                        <b>Thêm sản phẩm</b>

                        <select className="form-control"
                                style={{
                                    marginBottom: "5px",
                                    color: "black"
                                }}
                                value={type} onChange={(e) => this.setState({type: e.target.value})}>
                            <option value="" disabled>Loại*</option>
                            { types.map((t, index) => (
                                <option value={t} key={index}>
                                    {t}
                                </option>
                            ))}
                        </select>

                        <select className="form-control"
                                style={{
                                    marginBottom: "5px",
                                    color: "black"
                                }}
                                value={size} onChange={(e) => this.setState({size: e.target.value})}>
                            <option value="" disabled>Size*</option>
                            { sizes.map((t, index) => (
                                <option value={t} key={index}>
                                    {t}
                                </option>
                            ))}
                        </select>

                        <InputTag2
                            tags={color}
                            onChange={(c) => this.setState({color: c})}
                            list={colors}
                        />

                        <Input
                            placeholder="Miêu tả*"
                            value={name}
                            onChange={(e) => this.setState({name: e.target.value})}
                        />

                        <InputNumber
                            placeholder="Giá*"
                            value={price}
                            onChange={(price) => this.setState({price})}
                        />
                        <div className="form-group">
                            <button type="submit"
                                className="btn btn-info btn-sm"
                                disabled={invalidPaths.length > 0}>
                                Thêm
                            </button>

                            <button className="btn btn-info btn-sm btn-icon"
                                    onClick={() => {
                                        onChangeCatalog({price, name, type, size, color: color.join(", ")});
                                        this.setState({price: "", name: "", type: "", color: [], size: ""});
                                    }}
                                    disabled={invalidPaths.length > 0 || saving}>
                                <span className="btn-inner--text">Thêm danh mục</span>
                                { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>
                    </Fragment>
                )}
            />
        );
    }
}