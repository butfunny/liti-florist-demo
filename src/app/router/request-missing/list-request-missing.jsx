import React from "react";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import sortBy from "lodash/sortBy";
import moment from "moment";
import {formatNumber} from "../../common/common";
import classnames from "classnames";
import {Layout} from "../../components/layout/layout";
import {DatePicker} from "../../components/date-picker/date-picker";
import {warehouseApi} from "../../api/warehouse-api";
import {modals} from "../../components/modal/modals";
import {PreviewRequestModal} from "../warehouse/list-request/preview-request-modal";
import {PreviewRequestMissing} from "./preview-request-missing";
export class ListRequestMissing extends React.Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let endDay = new Date();
        endDay.setHours(23, 59, 59, 99);

        this.state = {
            items: [],
            requests: [],
            from: today,
            to: endDay,
            loading: true
        };



        warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
            this.setState({items: warehouseItems, subWarehouseItems});
            this.getRequests();
        });
    }

    getRequests() {
        let {from, to} = this.state;
        this.setState({loading: true});
        warehouseApi.getRequestMissing({from, to}).then((requests) => {
            this.setState({requests, loading: false})
        });
    }

    view(request) {

        let {items, subWarehouseItems} = this.state;

        const modal = modals.openModal({
            content: (
                <PreviewRequestMissing
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

        let {items, requests, subWarehouseItems, from, to, loading} = this.state;
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
                { permission[user.role].indexOf("warehouse.request-missing.view") == -1 ?
                    (
                        <div>
                            Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                        </div>

                    ) :
                    (
                        <div className="list-request-warehouse bill-report-route">

                            <div className="report-header row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="control-label"><b>Từ ngày</b></label>
                                        <DatePicker
                                            value={from}
                                            onChange={(from) => {
                                                this.setState({from})
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label className="control-label"><b>Tới ngày</b></label>
                                        <DatePicker
                                            value={to}
                                            onChange={(to) => this.setState({to})}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <button className="btn btn-info btn-sm btn-get btn-icon"
                                            disabled={loading}
                                            onClick={() => this.getRequests()}>
                                        Xem Hoá Đơn

                                        { loading && <span className="btn-inner--icon"><i className="fa fa-spinner fa-pulse"/></span>}
                                    </button>
                                </div>

                            </div>

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
                                            <b>{premises.find(p => p._id == request.warehouseID).name}</b>
                                            <div>
                                                {request.type}
                                            </div>
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