import React, {Fragment} from "react";
import {Input} from "../../../../components/input/input";
import {InputNumber} from "../../../../components/input-number/input-number";
import {Form} from "../../../../components/form/form";
import {minLength, required} from "../../../../components/form/validations";

export class BillAddItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            price: "",
            name: ""
        }
    }


    render() {

        let {price, name} = this.state;
        let {onChangeItem, onChangeCatalog, saving} = this.props;


        let validations = [
            {"price" : [required("Giá")]},
            {"name": [required("Tên sản phẩm")]}
        ];

        return (
            <Form
                onSubmit={() => {
                    onChangeItem({price, name});
                    this.setState({price: "", name: ""})
                }}
                formValue={this.state}
                validations={validations}
                className="bill-add-item"
                render={(getInvalidPath, invalidPaths) => (
                    <Fragment>
                        <b>Thêm sản phẩm</b>

                        <Input
                            placeholder="Tên sản phẩm"
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
                                className="btn btn-primary btn-sm"
                                disabled={invalidPaths.length > 0}>
                                Thêm
                            </button>

                            <button className="btn btn-primary btn-sm btn-icon"
                                    onClick={() => {
                                        onChangeCatalog({price, name});
                                        this.setState({price: "", name: ""})
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