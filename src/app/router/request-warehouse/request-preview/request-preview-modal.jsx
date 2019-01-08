import React from "react";
import {warehouseApi} from "../../../api/warehouse-api";
import {Input} from "../../../components/input/input";
import moment from "../request-warehouse-route";
import {ImgPreview} from "../../../components/img-repview/img-preview";
import {DataTable} from "../../../components/data-table/data-table";
export class RequestPreviewModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            flowersInWarehouse: []
        };

        warehouseApi.getRequestByID(props.request._id).then(({flowersInWarehouse}) => {
            this.setState({flowersInWarehouse})
        })
    }

    submit() {
        this.setState({saving: true});
        warehouseApi.acceptRequest(this.props.request._id).then(() => {
            this.props.onClose();
        })
    }

    render() {

        let {onDismiss, onClose, suppliers, request, flowers} = this.props;
        let {flowersInWarehouse, saving} = this.state;

        const requestTypesRender = {
            "request-from-supplier": () => <span><i className="fa fa-arrow-right text-primary" aria-hidden="true"/> Nhập từ <b className="text-primary">{suppliers.find(s => s._id == request.supplierID).name}</b></span>
        };

        const columns = [{
            label: "Sản Phẩm",
            width: "60%",
            display: (item) => {
                let product = flowers.find(f => f._id == item.parentID);
                return (
                    <div className="product-name">
                        <ImgPreview src={product.image}/> {item.quantity} - {product.name}
                    </div>
                )
            },
            minWidth: "300"
        }, {
            label: "Yêu Cầu",
            width: "20%",
            minWidth: "100",
            display: (row) => row.quantity
        }, {
            label: "Tồn Kho",
            width: "20%",
            minWidth: "100",
            display: (item) => {
                let found = flowersInWarehouse.find(i => i.parentID == item.parentID && i.price == item.price && i.oriPrice == item.oriPrice && i.supplierID == item.supplierID);
                return found ? found.quantity : 0
            }
        }];

        return (
            <div className="app-modal-box request-from-supplier request-preview-modal">
                <div className="modal-header">
                    <h6 className="modal-title">Chi tiết đơn</h6>
                    <button type="button" className="close" onClick={() => onDismiss()}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="text-item">
                        {requestTypesRender[request.requestType]()}
                    </div>

                    <div className="row">
                        <Input
                            className="col"
                            label="Người Gửi"
                            value={request.requestName}
                            readOnly
                        />

                        <Input
                            className="col"
                            label="Người Nhận"
                            value={request.receivedName}
                            readOnly
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    rows={request.items}
                />

                <div className="modal-footer">
                    <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Thôi</button>
                    <button type="button" className="btn btn-primary"
                            disabled={saving}
                            onClick={() => this.submit()}>
                        <span className="btn-text">
                            Xác Nhận
                        </span>

                        { saving && (<span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>)}

                    </button>
                </div>
            </div>
        );
    }
}