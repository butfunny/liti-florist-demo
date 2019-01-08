import React from "react";
import {Layout} from "../../components/layout/layout";
import {ButtonGroup} from "../../components/button-group/button-group";
import {customerApi} from "../../api/customer-api";
import {PaginationDataTable} from "../pagination-data-table/pagination-data-table";
import {warehouseApi} from "../../api/warehouse-api";
export class RequestWarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            requests: null,
            total: 0,
        };
    }

    render() {

        let {history} = this.props;

        let {requests, total} = this.state;

        return (
            <Layout
                activeRoute="Phiếu Xuất Nhập Kho"
            >
                <div className="request-warehouse-route">
                    <div className="card">
                        <div className="card-title">
                            Phiếu Xuất Nhập Kho
                        </div>

                        <div className="card-body">
                            <ButtonGroup
                                className="btn btn-primary"
                                customText="Thêm Phiếu"
                                actions={[{
                                    icon: <i className="fa fa-arrow-right text-primary" aria-hidden="true"/>,
                                    name: "Nhập hàng từ nhà cung cấp",
                                    click: () => history.push("/request-warehouse/request-from-supplier")
                                }, {
                                    icon: <i className="fa fa-arrow-left text-danger" aria-hidden="true"/>,
                                    name: "Trả hàng"
                                }, {
                                    icon: <i className="fa fa-exchange text-success" aria-hidden="true"/>,
                                    name: "Chuyển kho"
                                }]}
                            />
                        </div>

                        <PaginationDataTable
                            total={total}
                            columns={columns}
                            rows={requests}
                            api={({keyword, page, sortKey, isDesc}) => {
                                return warehouseApi.getRequest({
                                    keyword,
                                    skip: (page - 1) * 15,
                                    sortKey,
                                    isDesc
                                }).then(({requests, total}) => {
                                    this.setState({requests, total});
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