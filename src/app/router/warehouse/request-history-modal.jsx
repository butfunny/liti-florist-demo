import React from "react";
import moment from "moment";
import {DataTable} from "../../components/data-table/data-table";
import sortBy from "lodash/sortBy";
import {premisesInfo} from "../../security/premises-info";
export class RequestHistoryModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {requests, onClose, suppliers, product} = this.props;
        const premises = [{_id: "all", name: "Kho Tổng"}].concat(premisesInfo.getPremises());

        const requestTypesRender = {
            "request-from-supplier": (request) => <span><b className="text-primary">{suppliers.find(s => s._id == request.supplierID).name}</b> <i className="fa fa-arrow-right text-primary" aria-hidden="true"/> {premises.find(p => p._id == (request.toWarehouse ? request.toWarehouse : "all")).name}</span>,
            "return-to-supplier": () => <span><i className="fa fa-arrow-left text-danger" aria-hidden="true"/> Trả hàng </span>,
            "transfer-to-subwarehouse": (request) => <span>{premises.find(p => p._id == (request.fromWarehouse ? request.fromWarehouse : "all")).name} <i className="fa fa-arrow-right text-primary" aria-hidden="true"/> {premises.find(p => p._id == request.premisesID).name} </span>,
            "return-to-base": (request) => <span>Kho {premises.find(p => p._id == request.premisesID).name} <i className="fa fa-arrow-right text-danger" aria-hidden="true"/> Kho tổng </span>,
            "report-missing": (request) => <span><span className="text-danger">Hao Hụt</span></span>,
            "report-error": () => <span><span className="text-danger">Hủy Hỏng</span> </span>,
        };


        const getQuantity = (request) => {
            for (let item of request.items) {
                if (item.baseProductID == product._id || item.id == product._id) {
                    return item.quantity
                }
            }
        };


        let columns = [{
            label: "Thời Gian",
            display: (row) => moment(row.created).format("DD/MM/YYYY"),
            width: "30%",
            minWidth: "150"
        }, {
            label: "Hình Thức",
            display: (request) => requestTypesRender[request.requestType](request),
            width: "50%",
            minWidth: "150"
        }, {
            label: "Số Lượng",
            display: (request) => getQuantity(request),
            width: "20%",
            minWidth: "150"
        }];

        return (
            <div className="request-history-modal app-modal-box">
                <div className="modal-header">
                    <div className="modal-title">
                        Lịch sử xuất nhập
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    rows={sortBy(requests, l => -l.created)}
                />

                <div className="modal-footer">
                    <button type="button" className="btn btn-link " data-dismiss="modal" onClick={() => onClose()}>Đóng</button>
                </div>
            </div>
        );
    }
}