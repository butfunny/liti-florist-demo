import React, {Fragment} from "react";
import {premisesInfo} from "../../../security/premises-info";
import {maxVal, minVal, required} from "../../../components/form/validations";
import {Form} from "../../../components/form/form";
import {Input} from "../../../components/input/input";
import {InputNumber} from "../../../components/input-number/input-number";
import {warehouseApi} from "../../../api/warehouse-api";
export class TransferItemModal extends React.Component {

    constructor(props) {
        super(props);

        const premises = premisesInfo.getPremises();

        this.state = {
            qty: 0,
            warehouse: premises[0]._id
        }
    }

    submit() {
        let {items} = this.props;
        let {qty, warehouse} = this.state;
        const premises = premisesInfo.getPremises();

        const updatedItems = items.slice(0, qty);
        warehouseApi.updateItems({
            ids: updatedItems.map(i => i._id),
            update: {
                warehouseID: warehouse,
                warehouseName: premises.find(p => p._id == warehouse).name
            }
        }).then(() => {
            this.props.onClose(updatedItems.map(u => ({...u, warehouseID: warehouse, warehouseName: premises.find(p => p._id == warehouse).name})))
        })
    }

    render() {

        let {items, onDismiss} = this.props;
        let {qty, warehouse, saving} = this.state;

        const validations = [{
            qty: [minVal("Số lượng", 1), maxVal("Số Lượng", items.length)],
        }];

        const premises = premisesInfo.getPremises();


        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Chuyển hàng qua kho</h5>
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
                                        label={`Số Lượng (max ${items.length})`}
                                        value={qty}
                                        onChange={(e) => this.setState({qty: e.target.value})}
                                        error={getInvalidByKey("qty")}
                                    />

                                    <div className="form-group">

                                        <label>Kho</label>

                                        <select className="form-control" value={warehouse}
                                                onChange={(e) => this.setState({warehouse: e.target.value})}>
                                            { premises.map((item, index) => (
                                                <option value={item._id} key={index}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>

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