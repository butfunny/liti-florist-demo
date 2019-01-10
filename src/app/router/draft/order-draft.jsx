import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import sortBy from "lodash/sortBy";
import classnames from "classnames";
import moment from "moment";
import {formatNumber, getTotalBill} from "../../common/common";
import {UploadBtn} from "../order/bill-order";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import {ButtonGroup} from "../../components/button-group/button-group";
import {DataTable} from "../../components/data-table/data-table";
export class OrderDraft extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bills: null
        };

        billApi.getBillDraftList().then((bills) => {
            this.setState({bills})
        });

        premisesInfo.onChange(() => {
            this.setState({bills: null});
            billApi.getBillDraftList().then((bills) => {
                this.setState({bills})
            });
        })
    }

    remove(bill) {
        let {bills} = this.state;

        confirmModal.show({
            title: "Bạn muốn xoá hoá đơn này chứ?",
            description: "Sau khi xoá mọi dữ liệu về hoá đơn sẽ biến mất."
        }).then(() => {
            this.setState({bills: bills.filter(b => b._id != bill._id)});
            billApi.removeBillDraft(bill._id);
        });

    }

    render() {

        let {bills} = this.state;
        let {history} = this.props;

        let columns = [{
            label: "Thời gian",
            display: (bill) => moment(bill.deliverTime).format("DD/MM/YYYY HH:mm"),
            width: "30%",
            minWidth: "100",
            sortBy: (bill) => bill.deliverTime
        }, {
            label: "Thông tin đơn",
            display: (bill) => (
                <ColumnViewMore
                    header={bill.items.map((item, index) => (
                        <div key={index}>
                            <b>{item.quantity}</b> {item.name} {item.sale && <span className="text-primary">({item.sale}%)</span>} {item.vat ? <span className="text-primary"> - {item.vat}% VAT</span> : ""}
                        </div>
                    ))}
                    renderViewMoreBody={() => (
                        <Fragment>
                            {bill.vipSaleType && (
                                <div>VIP: <b>{bill.vipSaleType}</b></div>
                            )}

                            {bill.promotion && (
                                <span>{bill.promotion.name}: <b>{bill.promotion.discount}%</b></span>
                            )}

                            <div style={{
                                marginTop: "10px"
                            }}>
                                {bill.to.paymentType == "Nợ" ? <span className="text-danger"> Nợ: <b>{formatNumber(getTotalBill(bill))}</b></span> : <span>Tổng tiền: <b>{formatNumber(getTotalBill(bill))}</b></span>}
                            </div>

                            <div>Hình thức thanh toán: {bill.to.paymentType}</div>

                            <div>
                                Ghi chú: {bill.to.notes}
                            </div>

                            <div>
                                Nội dung thiệp: {bill.to.cardContent}
                            </div>
                        </Fragment>
                    )}
                    viewMoreText="Chi Tiết"
                    isShowViewMoreText={true}
                />
            ),
            width: "65%",
            minWidth: "250"
        }, {
            label: "",
            width: "5%",
            minWidth: "50",
            display: (bill) => (
                <ButtonGroup
                    actions={[{
                        name: "Sửa",
                        icon: <i className="fa fa-pencil text-primary"/>,
                        click: () => history.push(`/edit-bill-draft/${bill._id}`)
                    }, {
                        name: "Xóa",
                        icon: <i className="fa fa-trash text-danger"/>,
                        click: () => this.remove(bill)
                    }]}
                />
            )
        }];


        return (
            <Layout activeRoute="Đơn Sẵn">
                <div className="order-draft">
                    <div className="card">
                        <div className="card-title">
                            Đơn Sẵn
                        </div>

                        <DataTable
                            rows={bills}
                            columns={columns}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}