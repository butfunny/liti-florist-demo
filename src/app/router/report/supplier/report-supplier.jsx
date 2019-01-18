import React from "react";
import {Layout} from "../../../components/layout/layout";
import {getStartAndLastDayOfWeek} from "../../../common/common";
import {DatePicker} from "../../../components/date-picker/date-picker";
import {Select} from "../../../components/select/select";
import {warehouseApi} from "../../../api/warehouse-api";
import {productApi} from "../../../api/product-api";
import {DataTable} from "../../../components/data-table/data-table";
import {ColumnViewMore} from "../../../components/column-view-more/column-view-more";
import {ImgPreview} from "../../../components/img-repview/img-preview";
export class ReportSupplier extends React.Component {

    constructor(props) {
        super(props);
        let {from, to} = getStartAndLastDayOfWeek();

        this.state = {
            from,
            to,
            loading: true,
            requests: [],
            flowers: [],
            bills: [],
            suppliers: []
        };

        Promise.all([warehouseApi.getReportAllItems(), warehouseApi.getReportSupplier({from, to}), productApi.suppliers()]).then((resp) => {
            let {requests, flowers} = resp[0];
            let bills = resp[1];
            this.setState({loading: false,
                requests,
                flowers,
                suppliers: this.mapSuppliers(resp[2], bills, requests, flowers)})
        });

    }


    mapSuppliers(suppliers, bills, requests, flowers) {
        let {from, to} = this.state;

        const getTotalFlowerImport = (supplier) => {
            let filteredRequests = requests.filter(request => request.requestType == "request-from-supplier"
                && new Date(request.created).getTime() >= from.getTime()
                && new Date(request.created).getTime() <= to.getTime()
                && request.supplierID == supplier._id
            );

            let ret = [];
            let count = 0;

            for (let request of filteredRequests) {
                for (let product of request.items) {
                    let flower = flowers.find(f => f._id == product.parentID);
                    ret.push({
                            ...flower,
                            ...product,
                        }
                    );
                    count += product.quantity
                }
            }

            return {
                count,
                items: ret
            }
        };

        const getTotalFlowersUsed = (supplier) => {
            let count = 0;
            let ret = [];

            for (let bill of bills) {
                for (let product of bill.selectedFlower) {
                    if (product.supplierID == supplier._id) {
                        let flower = flowers.find(f => f._id == product.parentID);
                        ret.push({
                            ...flower,
                            ...product
                        });
                        count += product.quantity
                    }
                }
            }

            return {
                count,
                items: ret
            }

        };

        return suppliers.map((supplier => ({
            ...supplier,
            totalFlowerImport: getTotalFlowerImport(supplier),
            totalFlowerUsed: getTotalFlowersUsed(supplier)
        })))
    }

    getReport() {
        this.setState({loading: true});
        let {from, to, suppliers, requests, flowers} = this.state;
        warehouseApi.getReportSupplier({from, to}).then((bills) => {
            this.setState({suppliers: this.mapSuppliers(suppliers, bills, requests, flowers), loading: false})
        })
    }

    render() {

        let {loading, from, to, bills, flowers, requests, suppliers} = this.state;

        let columns = [{
            label: "Tên",
            width: "20%",
            minWidth: "150",
            display: (row) => row.name,
            sortBy: (row) => row.name
        }, {
            label: "Số Lượng Nhập",
            width: "40%",
            minWidth: "150",
            display: (row) => (
                <ColumnViewMore
                    header={row.totalFlowerImport.count}
                    viewMoreText={"Chi tiết"}
                    renderViewMoreBody={() => row.totalFlowerImport.items.map((item, index) => (
                        <div className="info-item product-name" key={index}>
                            <ImgPreview src={item.image}/> {item.name} - <span className="text-primary">{item.quantity}</span>
                        </div>
                    ))}
                    isShowViewMoreText={row.totalFlowerImport.count > 0}
                />
            ),
            sortBy: (row) => row.totalFlowerImport.count
        }, {
            label: "Số Lượng Bán",
            width: "40%",
            minWidth: "150",
            display: (row) => (
                <ColumnViewMore
                    header={row.totalFlowerUsed.count}
                    viewMoreText={"Chi tiết"}
                    renderViewMoreBody={() => row.totalFlowerUsed.items.map((item, index) => (
                        <div className="info-item product-name" key={index}>
                            <ImgPreview src={item.image}/> {item.name} - <span className="text-primary">{item.quantity}</span>
                        </div>
                    ))}
                    isShowViewMoreText={row.totalFlowerUsed.count > 0}
                />
            ),
            sortBy: (row) => row.totalFlowerUsed.count
        }];

        return (
            <Layout activeRoute="Nhà Cung Cấp">
                <div className="card report-supplier ">
                    <div className="card-title">
                        Báo cáo nhà cung cấp

                    </div>

                    <div className="card-body">
                        <div className="row first-margin"
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
                                    onClick={() => this.getReport()}
                                    disabled={loading}
                            >
                                <span className="btn-text">Xem</span>
                                {loading &&
                                <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>


                    </div>


                    <DataTable
                        rows={suppliers}
                        loading={loading}
                        columns={columns}
                    />
                </div>
            </Layout>
        );
    }
}