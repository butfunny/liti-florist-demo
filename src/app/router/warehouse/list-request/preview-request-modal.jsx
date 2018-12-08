import React from "react";
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
import moment from "moment";
import {formatNumber, keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import classnames from "classnames";
import {Input} from "../../../components/input/input";
import {warehouseApi} from "../../../api/warehouse-api";
import {userInfo} from "../../../security/user-info";
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
            warehouseApi.acceptRequest(request._id, {warehouseName: premises.find(p => p._id == request.toWarehouse).name}).then(({error}) => {
                if (error) {
                    this.setState({error: true});
                }
                onClose({...request, status: "Xác nhận"})
            })
        } else {
            warehouseApi.acceptReturn(request._id, ).then(({error}) => {
                if (error) {
                    this.setState({error: true});
                }
                onClose({...request, status: "Xác nhận"})
            })
        }
    }

    render() {
        let {items, request, subWarehouseItems} = this.props;
        let {reason, showError, saving, error} = this.state;
        const premises = premisesInfo.getPremises();
        const isError = () => {
            for (let item of request.items) {
                let itemFound = items.find(i => i._id == item.itemID);
                let subWarehouseItem = subWarehouseItems.find(i => i.itemID == item.itemID && i.warehouseID == request.fromWarehouse);
                if (request.toWarehouse) {
                    if (item.quantity > itemFound.quantity) {
                        return true;
                    }
                } else {
                    if (item.quantity > subWarehouseItem.quantity) return true;
                }
            }

            return false;
        };

        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();

        const getTotal = (selectedItems) => {
            let price = 0;
            for (let item of selectedItems) {
                let itemFound = items.find(i => i._id == item.itemID);
                price += itemFound.price * item.quantity;
            }

            return price;
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
                        { request.items.map((item, index) => {

                            let itemFound = items.find(i => i._id == item.itemID);
                            let subWarehouseItem = subWarehouseItems.find(i => i.itemID == item.itemID && i.warehouseID == request.fromWarehouse);

                            return (
                                <tr key={index}>
                                    <td>
                                        {itemFound.name}
                                    </td>
                                    <td>
                                        {item.quantity}
                                    </td>

                                    <td>
                                        { request.toWarehouse ?
                                                <span className={classnames(item.quantity > itemFound.quantity && "text-danger")}>{itemFound.quantity}</span>
                                            :
                                                <span className={classnames(item.quantity > subWarehouseItem.quantity && "text-danger")}>
                                                    {subWarehouseItem.quantity}
                                                </span>
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    Tổng tiền: <b>{formatNumber(getTotal(request.items))}</b>

                    <Input
                        disabled={request.status}
                        label="Lí do (Nếu từ chối)"
                        value={reason}
                        onChange={(e) => this.setState({reason: e.target.value})}
                        error={showError && reason.length == 0 ? "Lí do không được để trống khi từ chối" : ""}
                    />

                    {isError() && !request.status && (
                        <div className="text-danger">
                            Số lượng trong kho không đủ để thực hiện.
                        </div>
                    )}

                    { error && (
                        <div className="text-danger">
                            Lỗi khi gửi yêu cầu, vui lòng tải lại trang và thực hiện lại
                        </div>
                    )}
                </div>


                { !request.status && permission[user.role].indexOf("warehouse.request.edit") > -1 &&  (
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