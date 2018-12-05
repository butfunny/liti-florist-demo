import React from "react";
import {formatNumber} from "../../../../common/common";
import {productApi} from "../../../../api/product-api";
import uniqBy from "lodash/unionBy";
export class BillAddType extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ""
        }
    }

    addType() {
        let {value} = this.state;
        let {onChange, types} = this.props;
        const newTypes = types.concat({name: value});
        onChange(uniqBy(newTypes, t => t.name));
        this.setState({value: ""});
        productApi.createType({name: value});
    }

    removeType(type) {
        let {onChange, types} = this.props;
        onChange(types.filter(t => t.name != type.name));
        productApi.removeType(type.name)
    }

    render() {

        let {value} = this.state;
        let {types, onChange} = this.props;

        return (
            <div className="bill-catalog" style={{
                marginTop: "5px"
            }}>
                <b>Danh mục Loại</b>

                { types.map((type, index) => (
                    <div className="product" key={index}>
                        <div className="product-item">
                            {type.name}
                        </div>
                        <div className="product-edit"
                            style={{
                                right: "-35px"
                            }}
                        >
                            <button className="btn btn-danger btn-sm" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.removeType(type)
                            }}>
                                <i className="fa fa-trash"/>
                            </button>
                        </div>
                    </div>
                ))}

                <input className="form-control"
                       style={{
                           marginTop: "5px"
                       }}
                       value={value}
                       onChange={(e) => this.setState({value: e.target.value})}
                       placeholder="Thêm loại (Enter để thêm)"
                       onKeyDown={(e) => {
                           if (e.key == "Enter" && value.length > 0) this.addType()
                       }}
                />
            </div>
        );
    }
}