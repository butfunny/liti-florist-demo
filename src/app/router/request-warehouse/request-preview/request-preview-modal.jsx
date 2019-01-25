import React, {Fragment} from "react";
import {warehouseApi} from "../../../api/warehouse-api";
import {Input} from "../../../components/input/input";
import moment from "../request-warehouse-route";
import {ImgPreview} from "../../../components/img-repview/img-preview";
import {DataTable} from "../../../components/data-table/data-table";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import classnames from "classnames";
import {premisesInfo} from "../../../security/premises-info";
export class RequestPreviewModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            flowersInWarehouse: null
        };

        warehouseApi.getRequestByID(props.request._id).then(({flowersInWarehouse}) => {
            this.setState({flowersInWarehouse})
        })
    }

    submit() {
        this.setState({saving: true, error: false});
        warehouseApi.acceptRequest(this.props.request._id).then((resp) => {
            if (resp && resp.error) this.setState({error: resp.error, saving: false});
            else this.props.onClose();
        })
    }

    render() {

        let {onDismiss, onClose, suppliers, request, flowers} = this.props;
        let {flowersInWarehouse, saving, error} = this.state;
        const premises = [{_id: "all", name: "Kho Tổng"}].concat(premisesInfo.getPremises());

        const renderItemInWarehouse = (item) => {
            if (request.requestType == "request-from-supplier") {
                let found = flowersInWarehouse.find(i => i.parentID == item.parentID && i.price == item.price && i.oriPrice == item.oriPrice && i.supplierID == item.supplierID);
                return found ? found.quantity : 0
            }

            let found = flowersInWarehouse.find(i => i._id == item.id);
            return <span className={classnames(found.quantity < item.quantity && "text-danger")}>{found.quantity}</span>

        };

        const requestTypesRender = {
            "request-from-supplier": () => <span><b className="text-primary">{suppliers.find(s => s._id == request.supplierID).name}</b> <i className="fa fa-arrow-right text-primary" aria-hidden="true"/> {premises.find(p => p._id == (request.toWarehouse ? request.toWarehouse : "all")).name}</span>,
            "return-to-supplier": () => <span><i className="fa fa-arrow-left text-danger" aria-hidden="true"/> Trả hàng </span>,
            "transfer-to-subwarehouse": () => <span>{premises.find(p => p._id == (request.fromWarehouse ? request.fromWarehouse : "all")).name} <i className="fa fa-arrow-right text-primary" aria-hidden="true"/> {premises.find(p => p._id == request.premisesID).name} </span>,
            "return-to-base": () => <span>Kho {premises.find(p => p._id == request.premisesID).name} <i className="fa fa-arrow-right text-danger" aria-hidden="true"/> Kho tổng </span>,
            "report-missing": () => <span><span className="text-danger">Hao Hụt</span> - {premises.find(p => p._id == request.premisesID).name} </span>,
            "report-error": () => <span><span className="text-danger">Hủy Hỏng</span> - {premises.find(p => p._id == request.premisesID).name} </span>,
        };


        const columns = [{
            label: "Sản Phẩm",
            width: "60%",
            display: (item) => {
                let product = flowers.find(f => f._id == item.parentID);
                return (
                    <ColumnViewMore
                        header={
                            <div className="product-name">
                                <ImgPreview src={product.image}/> {product.name}
                            </div>
                        }
                        renderViewMoreBody={() => (
                            <Fragment>
                                { request.requestType != "request-from-supplier" && (
                                    <div className="info-item">
                                        Nhà cung cấp: {suppliers.find(s => s._id == item.supplierID) && suppliers.find(s => s._id == item.supplierID).name}
                                    </div>
                                )}

                                <div className="info-item">
                                    {product.productID} - {product.catalog}
                                </div>

                                <div className="info-item">
                                    Màu:
                                    {product.colors.map((color, index) => (
                                        <div key={index}
                                             style={{
                                                 background: color,
                                                 height: "15px",
                                                 width: "25px",
                                                 display: "inline-block",
                                                 marginLeft: "5px"
                                             }}
                                        />
                                    ))}
                                </div>

                                <div className="info-item">
                                    Đơn Vị Tính: {product.unit}
                                </div>

                                { product.lengthiness && (
                                    <div className="info-item">
                                        Chiều Dài Cành Hoa: {product.lengthiness}
                                    </div>
                                )}
                            </Fragment>
                        )}
                        viewMoreText="Chi Tiết"
                        isShowViewMoreText
                    />
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
            display: (item) => flowersInWarehouse && renderItemInWarehouse(item)
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

                { error && (
                    <div className="error text-danger" style={{
                        padding: "10px 15px",
                        fontSize: "13px"
                    }}>
                        {error}
                    </div>
                )}

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