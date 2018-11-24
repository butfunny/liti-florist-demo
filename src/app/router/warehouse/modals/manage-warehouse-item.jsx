import React, {Fragment} from "react";
import {Input} from "../../../components/input/input";
import {Form} from "../../../components/form/form";
import {minVal, required} from "../../../components/form/validations";
import {InputNumber} from "../../../components/input-number/input-number";
import {warehouseApi} from "../../../api/warehouse-api";
import {generateDatas} from "../../../common/common";
export class ManageWarehouseItemModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            qty: 1,
            catalog: "Hoa Chính",
            saving: false,
            oriPrice: 0,
            price: 0
        }
    }

    submit() {
        let {name, qty, catalog, oriPrice, price} = this.state;

        warehouseApi.createItem(generateDatas({name, catalog, oriPrice, price}, qty)).then((items) => {
            this.props.onClose(items)
        })
    }

    render() {

        let {items, onDismiss} = this.props;
        let {name, qty, catalog, saving, oriPrice, price} = this.state;

        const validations = [{
            name: [required("Tên sản phẩm"), (val) => ({
                text: "Tên đã trùng",
                valid: items.map(i => i.name.trim()).indexOf(val.trim()) == -1
            })
            ],
            qty: [minVal("Số lượng", 1)],
            oriPrice: [minVal("Giá Gốc", 0)],
            price: [minVal("Giá Bán", 0)],
        }];

        const catalogs = ["Hoa Chính", "Hoa Lá Phụ/Lá", "Phụ Kiện", "Cost"];

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Thêm sản phẩm</h5>
                    </div>

                    <Form
                        onSubmit={() => {
                            this.setState({saving: true});
                            !saving && this.submit()
                        }}
                        formValue={this.state}
                        validations={validations}
                        render={(getInvalidByKey) => (
                            <Fragment>
                                <div className="modal-body">
                                    <Input
                                        label="Tên"
                                        value={name}
                                        onChange={(e) => this.setState({name: e.target.value})}
                                        error={getInvalidByKey("name")}
                                    />


                                    <div className="form-group">

                                        <label>Danh mục</label>

                                        <select className="form-control" value={catalog}
                                                onChange={(e) => this.setState({catalog: e.target.value})}>
                                            { catalogs.map((item, index) => (
                                                <option value={item} key={index}>{item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="Số Lượng"
                                        value={qty}
                                        onChange={(e) => this.setState({qty: e.target.value})}
                                        error={getInvalidByKey("qty")}
                                    />

                                    <InputNumber
                                        label="Giá Gốc"
                                        value={oriPrice}
                                        onChange={(e) => this.setState({oriPrice: e})}
                                        error={getInvalidByKey("oriPrice")}
                                    />

                                    <InputNumber
                                        label="Giá Bán"
                                        value={price}
                                        onChange={(e) => this.setState({price: e})}
                                        error={getInvalidByKey("price")}
                                    />

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link" onClick={() => onDismiss()}>Đóng</button>
                                    <button type="submit" className="btn btn-info btn-icon">
                                        <span className="btn-inner--text">Lưu</span>
                                        { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                    </button>
                                </div>
                            </Fragment>
                        )}
                    />
                </div>
            </div>
        );
    }
}