import React from "react";
import {DatePicker} from "../../components/date-picker/date-picker";
import {warehouseCSVData} from "../warehouse/warehouse-csv-data";
import {CSVLink} from "react-csv";
import {security} from "../../security/secuiry-fe";
import {SelectTags} from "../../components/select-tags/select-tags";
import {warehouseApi} from "../../api/warehouse-api";
import {premisesInfo} from "../../security/premises-info";
import moment from "moment";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../components/img-repview/img-preview";
import sumBy from "lodash/sumBy";
export class ExportExcelModal extends React.Component {

    constructor(props) {
        super(props);

        let from = new Date();
        from.setHours(0, 0,0 ,0);

        let to = new Date();
        to.setHours(23, 59, 59, 99);

        this.state = {
            from,
            to,
            loading: true,
            requests: null,
            filteredTypes: []
        };

        this.submit()

    }

    submit() {
        let {from, to, filteredTypes} = this.state;

        warehouseApi.getRequestByDate({
            from,
            to,
            filteredTypes: filteredTypes.length == 0 ? this.types.filter(t => !t.hide()).map(t => t.value) : filteredTypes.map(s => this.types.find(type => type.label == s).value)
        }).then(({requests, total, flowers}) => {
            this.setState({requests, total, flowers, loading: false});
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

        let {from, to, loading, requests, filteredTypes, flowers} = this.state;
        let {onClose, suppliers} = this.props;
        const premises = [{_id: "all", name: "Kho Tổng"}].concat(premisesInfo.getPremises());

        const requestTypesRender = {
            "request-from-supplier": (row) => `Nhập từ nhà cung cấp: ${suppliers.find(s => s._id == row.supplierID).name} -> ${premises.find(p => p._id == (row.toWarehouse ? row.toWarehouse : "all")).name}`,
            "return-to-supplier": () => "Trả hàng",
            "transfer-to-subwarehouse": (row) => `${premises.find(p => p._id == (row.fromWarehouse ? row.fromWarehouse : "all")).name} -> ${premises.find(p => p._id == row.premisesID).name} `,
            "return-to-base": (row) => `${premises.find(p => p._id == row.premisesID).name} -> Kho Tổng `,
            "report-missing": (row) => `Hao Hụt - ${premises.find(p => p._id == row.premisesID).name} `,
            "report-error": (row) => `Hủy Hỏng - ${premises.find(p => p._id == row.premisesID).name} `,
        };

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


        const renderItems = (row) => {
            return row.items.map((item) => {
                let product = flowers.find(f => f._id == item.parentID);
                return `${item.quantity} - ${product.name}`
            }).join("\n")
        };

        const getCSVData = (requests) => {
            let csvData = [[
                "Thời gian",
                "Kiểu",
                "Người Gửi",
                "Người Nhận",
                "Sản Phẩm",
                "Tổng Tiền",
                "Trạng Thái",
                "Lí Do"
            ]];

            for (let row of requests) {
                csvData.push([
                    moment(row.created).format("DD/MM/YYYY HH:mm"),
                    requestTypesRender[row.requestType](row),
                    row.requestName,
                    row.receivedName,
                    renderItems(row),
                    sumBy(row.items, item => item.quantity * item.price),
                    status.find(r => r.value == row.status).label,
                    row.reason
                ])
            }

            return csvData;
        };



        return (
            <div className="app-modal-box bill-report-route">
                <div className="modal-header">
                    Xuất Phiếu
                </div>

                <div className="modal-body">

                    <SelectTags
                        label="Lọc Theo Kiểu"
                        tags={filteredTypes}
                        onChange={(filteredTypes) => this.setState({filteredTypes})}
                        list={this.types.filter(t => !t.hide()).map(s => s.label)}
                        placeholder="Chọn Kiểu"
                    />

                    <div className="row"
                    >
                        <DatePicker
                            className="col"
                            label="Từ Ngày"
                            value={from}
                            onChange={(from) => {
                                this.setState({from})
                            }}
                        />

                        <DatePicker
                            className="col"
                            label="Tới Ngày"
                            value={to}
                            onChange={(to) => {
                                this.setState({to})
                            }}
                        />

                        <button className="btn btn-primary"
                                onClick={() => this.submit()}
                                disabled={loading}
                        >
                            <span className="btn-text">Tìm</span>
                            {loading &&
                            <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                        </button>
                    </div>

                    { !loading && requests && (
                        <CSVLink
                            data={getCSVData(requests)}
                            filename={"phieu-xnk.csv"}
                            className="btn btn-primary btn-small">
                            <span className="btn-text">Xuất Excel</span>
                            <span className="loading-icon"><i className="fa fa-file-excel-o"/></span>
                        </CSVLink>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-link" onClick={() => onClose()}>Đóng</button>
                </div>
            </div>
        );
    }
}