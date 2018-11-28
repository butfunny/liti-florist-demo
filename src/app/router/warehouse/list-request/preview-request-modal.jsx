import React from "react";
import {premisesInfo} from "../../../security/premises-info";
import moment from "moment";
import {keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import classnames from "classnames";
import {Input} from "../../../components/input/input";
import {warehouseApi} from "../../../api/warehouse-api";
export class PreviewRequestModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reason: props.request.reason || "",
            showError: false,
            saving: false
        }
    }

    reject() {
        let {request, onClose} = this.props;
        let {reason} = this.state;
        warehouseApi.rejectRequest(request._id, {reason}).then(() => {
            onClose({...request, status: "Từ chối", reason});
        })
    }

    submit() {
        let {request, onClose} = this.props;
        const premises = premisesInfo.getPremises();
        this.setState({saving: true});
        if (request.toWarehouse) {
            warehouseApi.acceptRequest(request._id, {warehouseName: premises.find(p => p._id == request.toWarehouse).name}).then(() => {
                onClose({...request, status: "Xác nhận"})
            })
        } else {
            warehouseApi.acceptReturn(request._id, ).then(() => {
                onClose({...request, status: "Xác nhận"})
            })
        }
    }

    render() {
        let {items, request} = this.props;
        let {reason, showError, saving} = this.state;
        const premises = premisesInfo.getPremises();
        const getItems = (ids) => items.filter(i => ids.indexOf(i._id) > -1);
        const isError = () => {
            let selectedItems = keysToArray(groupBy(getItems(request.items), i => i.name));
            for (let item of selectedItems) {
                if (request.toWarehouse) {
                    if (item.value.length > items.filter(i => i.name == item.key && !i.warehouseID).length) {
                        return true;
                    }
                } else {
                    if (item.value.length > items.filter(i => i.name == item.key && i.warehouseID && i.warehouseID == premises.find(p => p._id == request.fromWarehouse)._id).length) return true;
                }
            }

            return false;
        };

        return (
            <div className="preview-request-modal app-modal-box">
                <div className="modal-header">
                    <h5 className="modal-title">Chi tiết đơn</h5>
                </div>

                <div className="modal-body">
                    <div>
                        { request.toWarehouse ? (
                            <span>
                                Kho tổng <i className="fa fa-arrow-right text-success"/> Kho {premises.find(p => p._id == request.toWarehouse).name}
                            </span>
                        ) : (
                            <span>
                                Kho {premises.find(p => p._id == request.fromWarehouse).name} <i className="fa fa-arrow-right text-danger"/> Kho tổng
                            </span>
                        )}
                    </div>
                    <div>
                        Người gửi: {request.requestName}
                    </div>
                    <div>
                        Người nhận: {request.receivedName}
                    </div>


                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col"
                                    style={{width: "200px"}}
                                >Mặt Hàng</th>
                                <th scope="col">Yêu cầu</th>
                                <th scope="col">Tồn Kho</th>
                            </tr>
                        </thead>
                        <tbody>
                        { keysToArray(groupBy(getItems(request.items), i => i.name)).map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {item.key}
                                </td>
                                <td>
                                    {item.value.length}
                                </td>

                                <td>
                                    { request.toWarehouse ?
                                        (
                                            <span className={classnames(item.value.length > items.filter(i => i.name == item.key && !i.warehouseID).length && "text-danger")}>{items.filter(i => i.name == item.key && !i.warehouseID).length}</span>
                                        ) :
                                        (
                                            <span className={classnames(item.value.length > items.filter(i => i.name == item.key && i.warehouseID && i.warehouseID == premises.find(p => p._id == request.fromWarehouse)._id).length && "text-danger")}>
                                                {items.filter(i => i.name == item.key && i.warehouseID && i.warehouseID == premises.find(p => p._id == request.fromWarehouse)._id).length}
                                                </span>
                                        )
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Input
                        disabled={request.status}
                        label="Lí do (Nếu từ chối)"
                        value={reason}
                        onChange={(e) => this.setState({reason: e.target.value})}
                        error={showError && reason.length == 0 ? "Lí do không được để trống khi từ chối" : ""}
                    />

                    {isError() && (
                        <div className="text-danger">
                            Số lượng trong kho không đủ để thực hiện.
                        </div>
                    )}
                </div>


                { !request.status && (
                    <div className="modal-footer">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => {
                            this.setState({showError: true});
                            reason.length > 0 && this.reject();
                        }}>
                            Từ Chối
                        </button>

                        { !isError() && (
                            <button className="btn btn-outline-primary btn-sm btn-icon" onClick={() => this.submit()}>
                                <span className="btn-inner--text">Xác Nhận</span>
                                { saving && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        )}


                    </div>
                )}
            </div>
        );
    }
}