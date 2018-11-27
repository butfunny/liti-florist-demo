import React from "react";
import {premisesInfo} from "../../../security/premises-info";
import moment from "moment";
import {keysToArray} from "../../../common/common";
import groupBy from "lodash/groupBy";
import classnames from "classnames";
import {Input} from "../../../components/input/input";
export class PreviewRequestModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reason: ""
        }
    }

    render() {
        let {items, request} = this.props;
        let {reason} = this.state;
        const premises = premisesInfo.getPremises();
        const getItems = (ids) => items.filter(i => ids.indexOf(i._id) > -1);


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
                                Kho {premises.find(p => p._id == items.find(i => i._id == request.items[0]).warehouseID).name} <i className="fa fa-arrow-right text-danger"/> Kho tổng
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
                                            <span className={classnames(item.value.length > items.filter(i => i.name == item.key && i.warehouseID && i.warehouseID == premises.find(p => p._id == items.find(i => i._id == request.items[0]).warehouseID)._id).length && "text-danger")}>{items.filter(i => i.name == item.key && i.warehouseID && i.warehouseID == premises.find(p => p._id == items.find(i => i._id == request.items[0]).warehouseID)._id).length}</span>
                                        )
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Input
                        label="Lí do (Nếu từ chối)"
                        value={reason}
                        onChange={(e) => this.setState({reason: e.target.value})}
                    />
                </div>

                <div className="modal-footer">
                    <button className="btn btn-outline-danger btn-sm">
                        Từ Chối
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                        Xác Nhận
                    </button>
                </div>
            </div>
        );
    }
}