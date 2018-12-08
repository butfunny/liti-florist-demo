import React from "react";
import {Layout} from "../../../components/layout/layout";
import {warehouseApi} from "../../../api/warehouse-api";
import sortBy from "lodash/sortBy";
import classnames from "classnames";
import moment from "moment";
import {formatNumber, getTotalBill, keysToArray} from "../../../common/common";
import {UploadBtn} from "../../order/bill-order";
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
import groupBy from "lodash/groupBy";
import {modals} from "../../../components/modal/modals";
import {PreviewRequestModal} from "./preview-request-modal";
import {userInfo} from "../../../security/user-info";
import sumBy from "lodash/sumBy";

export class ListRequestWarehouse extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            requests: []
        };

        warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
            this.setState({items: warehouseItems, subWarehouseItems});
            warehouseApi.getRequests().then((requests) => {
                this.setState({requests})
            });
        });
    }

    view(request) {

        let {items, subWarehouseItems} = this.state;

        const modal = modals.openModal({
            content: (
                <PreviewRequestModal
                    request={request}
                    items={items}
                    subWarehouseItems={subWarehouseItems}
                    onClose={(updatedRequest) => {
                        let {requests} = this.state;
                        warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
                            this.setState({
                                requests: requests.map(r => r._id == updatedRequest._id ? updatedRequest : r),
                                items: warehouseItems,
                                subWarehouseItems
                            });
                            modal.close();
                        })
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    render() {

        let {items, requests, subWarehouseItems} = this.state;
        const premises = premisesInfo.getPremises();
        const getItems = (ids) => items.filter(i => ids.indexOf(i._id) > -1);


        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        const getTotal = (selectedItems) => {
            let price = 0;
            for (let item of selectedItems) {
                let itemFound = items.find(i => i._id == item.itemID);
                price += itemFound.price * item.quantity;
            }

            return price;
        };

        return (
            <Layout
                activeRoute="Kho"
            >
                { permission[user.role].indexOf("warehouse.request.view") == -1 ?
                    (
                        <div>
                            Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                        </div>

                    ) :
                    (
                        <div className="list-request-warehouse">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th scope="col"
                                        style={{width: "200px"}}
                                    >Thời gian
                                    </th>
                                    <th scope="col">Kho Hàng</th>
                                    <th scope="col">Thông Tin</th>
                                    <th scope="col">Tình Trạng</th>
                                    <th
                                        style={{width: "50px"}}
                                        scope="col"/>
                                </tr>
                                </thead>
                                <tbody>
                                {sortBy(requests, "created").reverse().map((request, index) => (
                                    <tr key={index}>
                                        <td>
                                            {moment(request.created).format("DD/MM/YYYY HH:mm")}
                                        </td>
                                        <td>
                                            {request.toWarehouse ? (
                                                <span>
                                            Kho tổng <i
                                                    className="fa fa-arrow-right text-success"/> Kho {premises.find(p => p._id == request.toWarehouse).name}
                                        </span>
                                            ) : (
                                                <span>
                                            Kho {premises.find(p => p._id == request.fromWarehouse).name} <i
                                                    className="fa fa-arrow-right text-danger"/> Kho tổng
                                        </span>
                                            )}
                                        </td>
                                        <td>
                                            {request.items.map((item, index) => {
                                                let itemFound = items.find(i => i._id == item.itemID);

                                                return (
                                                    <div key={index}>
                                                        {item.quantity} {itemFound.name}
                                                    </div>
                                                )
                                            })}

                                            Tổng giá trị: <b>{formatNumber(getTotal(request.items))}</b>
                                        </td>
                                        <td>
                                            {request.status ? <span
                                                className={classnames(request.status == "Từ chối" && "text-danger", request.status == "Xác nhận" && "text-success")}>{request.status}</span> : "Chờ xử lý"}
                                            {request.status == "Từ chối" &&
                                            <div className="text-danger">{request.reason}</div>}
                                        </td>
                                        <td>
                                            <button className="btn btn-outline-primary btn-sm"
                                                    onClick={() => this.view(request)}>
                                                <i className="fa fa-eye"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </Layout>
        );
    }
}