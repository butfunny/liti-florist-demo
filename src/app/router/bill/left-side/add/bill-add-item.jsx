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

export class BillAddItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            price: "",
            name: "",
            type: "",
            color: "",
        };


    }


    render() {

        let {price, name, type, color} = this.state;
        let {onChangeItem, onChangeCatalog, saving, types, colors} = this.props;


        let validations = [
            {"type" : [required("Loại")]},
            {"color" : [required("Màu")]},
            {"price" : [required("Giá")]},
            {"name": [required("Chi tiết")]}
        ];

        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();

        return (
            <Form
                onSubmit={() => {
                    onChangeItem({price, name, type, color});
                    this.setState({price: "", name: "", type: "", color: ""});
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
                            <option value="" disabled>Loại</option>
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
                                value={color} onChange={(e) => this.setState({color: e.target.value})}>
                            <option value="" disabled>Màu</option>
                            { colors.map((t, index) => (
                                <option value={t} key={index}>
                                    {t}
                                </option>
                            ))}
                        </select>

                        <Input
                            placeholder="Miêu tả"
                            value={name}
                            onChange={(e) => this.setState({name: e.target.value})}
                        />

                        <InputNumber
                            placeholder="Giá"
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
                                        onChangeCatalog({price, name, type, color});
                                        this.setState({price: "", name: "", type: "", color: "", types: types.concat(type), colors: colors.concat(color)});
                                        productApi.createType({name: type});
                                        productApi.createColor({name: color});
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