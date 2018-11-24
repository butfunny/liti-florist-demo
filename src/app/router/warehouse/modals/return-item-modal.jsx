import React, {Fragment} from "react";
import {premisesInfo} from "../../../security/premises-info";
import {maxVal, minVal, required} from "../../../components/form/validations";
import {Form} from "../../../components/form/form";
import {Input} from "../../../components/input/input";
import {InputNumber} from "../../../components/input-number/input-number";
import {warehouseApi} from "../../../api/warehouse-api";
import {modals} from "../../../components/modal/modals";
export class ReturnItemModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            qty: 0
        }
    }

    submit() {
        let {items} = this.props;
        let {qty} = this.state;

        const updatedItems = items.slice(0, qty);
        warehouseApi.updateItems({
            ids: updatedItems.map(i => i._id),
            update: {
                warehouseID: null,
                warehouseName: null
            }
        }).then(() => {
            this.props.onClose(updatedItems.map(u => ({...u, warehouseID: null, warehouseName: null})))
        })
    }

    render() {

        let {items, onDismiss} = this.props;
        let {qty, saving} = this.state;

        const validations = [{
            qty: [minVal("Số lượng", 1), maxVal("Số Lượng", items.length)],
        }];


        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Trả hàng về kho tổng</h5>
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