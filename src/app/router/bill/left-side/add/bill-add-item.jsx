import React, {Fragment} from "react";
import {Input} from "../../../../components/input/input";
import {InputNumber} from "../../../../components/input-number/input-number";
import {Form} from "../../../../components/form/form";
import {minLength, required} from "../../../../components/form/validations";
import {AutoCompleteNormal} from "../../../../components/auto-complete/auto-complete-normal";
import {productApi} from "../../../../api/product-api";
import uniq from "lodash/uniq";

export class BillAddItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            price: "",
            name: "",
            type: "",
            color: "",
            types: [],
            colors: []
        };

        productApi.getTypes().then((types) => {
            this.setState({types: types.map(t => t.name)})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: colors.map(t => t.name)})
        })
    }


    render() {

        let {price, name, type, types, colors, color} = this.state;
        let {onChangeItem, onChangeCatalog, saving} = this.props;


        let validations = [
            {"type" : [required("Loại")]},
            {"color" : [required("Màu")]},
            {"price" : [required("Giá")]},
            {"name": [required("Chi tiết")]}
        ];

        return (
            <Form
                onSubmit={() => {
                    onChangeItem({price, name, type, color});
                    this.setState({price: "", name: "", type: "", color: "", types: types.concat(type), colors: colors.concat(color)});
                    productApi.createType({name: type});
                    productApi.createColor({name: color});
                }}
                formValue={this.state}
                validations={validations}
                className="bill-add-item"
                render={(getInvalidPath, invalidPaths) => (
                    <Fragment>
                        <b>Thêm sản phẩm</b>

                        <AutoCompleteNormal
                            placeholder="Loại"
                            value={type}
                            onSelect={(type) => this.setState({type})}
                            onChange={(type) => this.setState({type})}
                            displayAs={(type) => type}
                            defaultList={uniq(types)}
                        />

                        <AutoCompleteNormal
                            placeholder="Màu"
                            value={color}
                            onSelect={(color) => this.setState({color})}
                            onChange={(color) => this.setState({color})}
                            displayAs={(color) => color}
                            defaultList={uniq(colors)}
                        />

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