import React, {Fragment} from "react";
import {minVal, required} from "../../components/form/validations";
import {Form} from "../../components/form/form";
import {Input} from "../../components/input/input";
import {InputNumber} from "../../components/input-number/input-number";
import {warehouseApi} from "../../api/warehouse-api";
import {generateDatas} from "../../common/common";
export class EditWareHouseItemModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: props.updatedItems[0].name,
            qty: props.updatedItems.length,
            catalog: props.updatedItems[0].catalog,
            saving: false,
            oriPrice: props.updatedItems[0].oriPrice,
            price: props.updatedItems[0].price
        }
    }


    submit() {
        let {updatedItems} = this.props;
        let items = [...this.props.items];
        let {name, catalog, oriPrice, price, qty} = this.state;

        warehouseApi.updateItems({
            ids: updatedItems.map(i => i._id),
            update: {name, catalog, oriPrice, price}
        }).then(() => {
            items = items.map(i => i.name == updatedItems[0].name ? {...i, name, catalog, oriPrice, price} : i);
            if (qty > updatedItems.length) {
                warehouseApi.createItem(generateDatas({name, catalog, oriPrice, price}, qty - updatedItems.length)).then((createdItems) => {
                    this.props.onClose(items.concat(createdItems))
                })
            }

            if (qty < updatedItems.length) {
                const removedIds = updatedItems.slice(0, updatedItems.length - qty).map(i => i._id);
                warehouseApi.removeItems({ids: removedIds}).then(() => {
                    this.props.onClose(items.filter(i => removedIds.indexOf(i._id) == -1))
                })
            }

            if (qty == updatedItems.length) {
                this.props.onClose(items)
            }
        })
    }

    render() {

        let {items, onDismiss, updatedItems} = this.props;
        let {name, qty, catalog, saving, oriPrice, price} = this.state;

        const validations = [{
            name: [required("Tên sản phẩm"), (val) => ({
                text: "Tên đã trùng",
                valid: items.filter(i => i.name != updatedItems[0].name).map(i => i.name.trim()).indexOf(val.trim()) == -1
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
                        <h5 className="modal-title">Sửa {updatedItems[0].name}</h5>
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
                                    <button type="submit" className="btn btn-primary btn-icon">
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