import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {ButtonGroup} from "../../components/button-group/button-group";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import {warehouseApi} from "../../api/warehouse-api";
import moment from "moment";
import {productApi} from "../../api/product-api";
import {formatNumber} from "../../common/common";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../components/img-repview/img-preview";
import sumBy from "lodash/sumBy";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {modals} from "../../components/modal/modals";
import {RequestPreviewModal} from "./request-preview/request-preview-modal";
import {premisesInfo} from "../../security/premises-info";
import {SelectTags} from "../../components/select-tags/select-tags";
import {security} from "../../security/secuiry-fe";

export class RequestWarehouseRoute extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            requests: null,
            total: 0,
            suppliers: [],
            flowers: [],
            filteredStatuses: [],
            filteredTypes: []
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }



    viewRequest(row) {
        const modal = modals.openModal({
            content: (
                <RequestPreviewModal
                    flowers={this.state.flowers}
                    request={row}
                    suppliers={this.state.suppliers}
                    onDismiss={() => modal.close()}
                    onClose={() => {
                        modal.close();
                        this.table.refresh();
                    }}
                />
            )
        })
    }

    rejectRequest(row) {
        confirmModal.showInput({
            title: "Từ chối phiếu",
            label: "Lý do"
        }).then((reason) => {
            warehouseApi.updateRequest(row._id, {
                status: "reject",
                reason
            }).then(() => {
                this.table.refresh();
            })
        })
    }

    types = [{
        value: "request-from-supplier",
        label: "Nhập hàng từ nhà cung cấp",
        hide: () => !security.isHavePermission(["warehouse.request.view-request-from-supplier"])
    }, {
        value: "return-to-supplier",
        label: "Trả hàng",
        hide: () => !security.isHavePermission(["warehouse.request.view-return-to-supplier"])
    }, {
        value: "transfer-to-subwarehouse",
        label: "Xuất kho",
        hide: () => !security.isHavePermission(["warehouse.request.view-transfer-to-subwarehouse"])
    }, {
        value: "return-to-base",
        label: "Trả kho",
        hide: () => !security.isHavePermission(["warehouse.request.view-return-to-base"])
    }, {
        value: "report-missing",
        label: "Hao hụt",
        hide: () => !security.isHavePermission(["warehouse.request.view-report-flower"])
    }, {
        value: "report-error",
        label: "Hủy Hỏng",
        hide: () => !security.isHavePermission(["warehouse.request.view-report-flower"])
    }];

    render() {

        let {history} = this.props;

        let {requests, total, suppliers, flowers, filteredStatuses, filteredTypes} = this.state;

        const status = [{
            value: "pending",
            background: "",
            label: "Chờ xử lý",
            color: ""
        }, {
            value: "accepted",
            background: "rgb(29,201,183, .1)",
            label: "Xác nhận",
            color: "#1dc9b7"
        }, {
            value: "reject",
            background: "rgb(253,57,122, .1)",
            label: "Từ chối",
            color: "#fd397a"
        }];

        const premises = premisesInfo.getPremises();


        let columns = [{
            label: "Thời gian",
            width: "20%",
            display: (row) => moment(row.created).format("DD/MM/YYYY HH:mm"),
            minWidth: "150",
            sortKey: "created"
        }, {
            label: "Kiểu",
            width: "30%",
            display: (row) => {
                const requestTypesRender = {
                    "request-from-supplier": () => <span><i className="fa fa-arrow-right text-primary" aria-hidden="true"/> Nhập từ <b className="text-primary">{suppliers.find(s => s._id == row.supplierID).name}</b></span>,
                    "return-to-supplier": () => <span><i className="fa fa-arrow-left text-danger" aria-hidden="true"/> Trả hàng </span>,
                    "transfer-to-subwarehouse": () => <span>Kho Tổng <i className="fa fa-arrow-right text-primary" aria-hidden="true"/> {premises.find(p => p._id == row.premisesID).name} </span>,
                    "return-to-base": () => <span>{premises.find(p => p._id == row.premisesID).name} <i className="fa fa-arrow-right text-danger" aria-hidden="true"/> Kho Tổng </span>,
                    "report-missing": () => <span><span className="text-danger">Hao Hụt</span> - {premises.find(p => p._id == row.premisesID).name} </span>,
                    "report-error": () => <span><span className="text-danger">Hủy Hỏng</span> - {premises.find(p => p._id == row.premisesID).name} </span>,
                };

                return (
                    <div>
                        {requestTypesRender[row.requestType]()}

                        <div className="info-item">
                            Người gửi: {row.requestName}
                        </div>

                        <div className="info-item">
                            Người nhận: {row.receivedName}
                        </div>
                    </div>
                );
            },
            minWidth: "200",
            sortKey: "type"
        }, {
            label: "Sản phẩm",
            width: "35%",
            display: (row) => (
                <Fragment>
                    {row.items.map((item, index) => {
                        let product = flowers.find(f => f._id == item.parentID);

                        return (
                            <ColumnViewMore
                                key={index}
                                header={
                                    <div className="product-name">
                                        <ImgPreview src={product.image}/> {item.quantity} - {product.name}
                                    </div>
                                }
                                renderViewMoreBody={() => (
                                    <Fragment>
                                        { row.requestType != "request-from-supplier" && (
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
                    })}

                    <div style={{
                        fontSize: "11px",
                        marginTop: "10px"
                    }}>
                        Tổng Tiền: {formatNumber(sumBy(row.items, item => item.quantity * item.price))}
                    </div>
                </Fragment>
            ),
            minWidth: "250",
        }, {
            label: "Trạng Thái",
            width: "10%",
            display: (row) => {
                if (row.status == "reject") {
                    return (
                        <span style={{color: status.find(r => r.value == row.status).color}}>
                            {status.find(r => r.value == row.status).label}

                            <div style={{fontSize: "11px"}}>
                                Lí do: <b>{row.reason}</b>
                            </div>

                        </span>
                    )
                }

                return <span style={{color: status.find(r => r.value == row.status).color}}>{status.find(r => r.value == row.status).label}</span>
            },
            minWidth: "100",
            sortKey: "status"
        }, {
            label: "",
            width: "5%",
            display: (row) => {

                const permissions = [{
                    type: "request-from-supplier",
                    havePermission: () => security.isHavePermission(["warehouse.request.update-request-from-supplier"])
                }, {
                    type: "return-to-supplier",
                    havePermission: () => security.isHavePermission(["warehouse.request.update-return-to-supplier"])
                }, {
                    type: "transfer-to-subwarehouse",
                    havePermission: () => security.isHavePermission(["warehouse.request.update-transfer-to-subwarehouse"])
                }, {
                    type: "return-to-base",
                    havePermission: () => security.isHavePermission(["warehouse.request.update-transfer-to-subwarehouse"])
                }, {
                    type: "report-missing",
                    havePermission: () => security.isHavePermission(["warehouse.request.request.update-report-flower"])
                }, {
                    type: "report-error",
                    havePermission: () => security.isHavePermission(["warehouse.request.request.update-report-flower"])
                }];


                return row.status == "pending" && permissions.find(p => p.type == row.requestType).havePermission() && (
                    <ButtonGroup
                        actions={[{
                            name: "Chi tiết",
                            icon: <i className="fa fa-file-text"/>,
                            click: () => this.viewRequest(row)
                        }, {
                            name: "Từ chối",
                            icon: <i className="fa fa-times text-danger"/>,
                            click: () => this.rejectRequest(row),
                            hide: () => row.status == "reject"
                        }]}
                    />
                )
            },
            minWidth: "50"
        }];


        return (
            <Layout
                activeRoute="Phiếu Xuất Nhập Kho"
            >
                <div className="request-warehouse-route products-route">
                    <div className="card">
                        <div className="card-title">
                            Phiếu Xuất Nhập Kho
                        </div>

                        <div className="card-body">
                            { security.isHavePermission([
                                "warehouse.request.create-request-from-supplier",
                                "warehouse.request.create-return-to-supplier",
                                "warehouse.request.create-transfer-to-subwarehouse",
                                "warehouse.request.create-return-to-base",
                                "warehouse.request.create-report-flower"
                                ]
                            ) && (
                                <ButtonGroup
                                    className="btn btn-primary"
                                    customText="Thêm Phiếu"
                                    actions={[{
                                        icon: <i className="fa fa-arrow-right text-primary" aria-hidden="true"/>,
                                        name: "Nhập hàng từ nhà cung cấp",
                                        click: () => history.push("/request-warehouse/request-from-supplier"),
                                        hide: () => !security.isHavePermission(["warehouse.request.create-request-from-supplier"])
                                    }, {
                                        icon: <i className="fa fa-arrow-left text-success" aria-hidden="true"/>,
                                        name: "Trả hàng",
                                        click: () => history.push("/request-warehouse/return-to-supplier"),
                                        hide: () => !security.isHavePermission(["warehouse.request.create-return-to-supplier"])
                                    }, {
                                        icon: <i className="fa fa-exchange text-primary" aria-hidden="true"/>,
                                        name: "Xuất kho",
                                        click: () => history.push("/request-warehouse/transfer-to-subwarehouse"),
                                        hide: () => !security.isHavePermission(["warehouse.request.create-transfer-to-subwarehouse"])
                                    }, {
                                        icon: <i className="fa fa-retweet text-success" aria-hidden="true"/>,
                                        name: "Trả kho",
                                        click: () => history.push("/request-warehouse/return-to-base"),
                                        hide: () => !security.isHavePermission(["warehouse.request.create-return-to-base"])
                                    }, {
                                        icon: <i className="fa fa-exclamation text-danger" aria-hidden="true"/>,
                                        name: "Báo cáo hao hụt/hủy hỏng",
                                        click: () => history.push("/request-warehouse/report-flower"),
                                        hide: () => !security.isHavePermission(["warehouse.request.create-report-flower"])
                                    }]}
                                />
                            )}


                            <div className="filter-wrapper">
                                <div className="filter-col">
                                    <SelectTags
                                        label="Lọc Theo Trạng Thái"
                                        tags={filteredStatuses}
                                        onChange={(filteredStatuses) => this.setState({filteredStatuses}, () => this.table.reset())}
                                        list={status.map(s => s.label)}
                                        displayAs={(s) => {}}
                                        placeholder="Chọn Trạng Thái"
                                    />
                                </div>

                                <div className="filter-col">
                                    <SelectTags
                                        label="Lọc Theo Kiểu"
                                        tags={filteredTypes}
                                        onChange={(filteredTypes) => this.setState({filteredTypes}, () => this.table.reset())}
                                        list={this.types.filter(t => !t.hide()).map(s => s.label)}
                                        placeholder="Chọn Kiểu"
                                    />
                                </div>
                            </div>
                        </div>

                        <PaginationDataTable
                            placeholderSearch="Tìm theo tên người gửi hoặc người nhận"
                            ref={elem => this.table = elem}
                            rowStyling={(row) => ({background: status.find(r => r.value == row.status).background})}
                            total={total}
                            columns={columns}
                            rows={requests}
                            api={({keyword, page, sortKey, isDesc}) => {
                                return warehouseApi.getRequest({
                                    keyword,
                                    skip: (page - 1) * 15,
                                    sortKey,
                                    isDesc,
                                    filteredStatuses: filteredStatuses.map(s => status.find(status => status.label == s).value),
                                    filteredTypes: filteredTypes.length == 0 ? this.types.filter(t => !t.hide()).map(t => t.value) : filteredTypes.map(s => this.types.find(type => type.label == s).value)
                                }).then(({requests, total, flowers}) => {
                                    this.setState({requests, total, flowers});
                                    return Promise.resolve();
                                })
                            }}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}