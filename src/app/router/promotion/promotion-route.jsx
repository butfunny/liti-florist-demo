import React from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManagePromotionModal} from "./manage-promotion-modal";
import {promotionApi} from "../../api/promotion-api";
import moment from "moment";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {securityApi} from "../../api/security-api";
import {permissionInfo} from "../../security/premises-info";
import {userInfo} from "../../security/user-info";
import {Input} from "../../components/input/input";
import {Checkbox} from "../../components/checkbox/checkbox";
import {security} from "../../security/secuiry-fe";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {formatNumber} from "../../common/common";
import {ButtonGroup} from "../../components/button-group/button-group";
import {DataTable} from "../../components/data-table/data-table";
export class PromotionRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            promotions: []
        };

        promotionApi.get().then((promotions) => {
            this.setState({promotions})
        })
    }

    addItem() {

        let startDate = new Date();
        startDate.setHours(0,0,0,0);
        let endDate = new Date();
        endDate.setHours(23,59,59,0);

        const modal = modals.openModal({
            content: (
                <ManagePromotionModal
                    promotion={{from: startDate, to: endDate, name: "", discount: 0}}
                    onDismiss={() => modal.close()}
                    onClose={(promotion) => {
                        let {promotions} = this.state;
                        promotionApi.create(promotion).then((promotion) => {
                            this.setState({promotions: promotions.concat(promotion)});
                            modal.close();
                        })
                    }}
                />
            )
        })
    }

    edit(item) {
        const modal = modals.openModal({
            content: (
                <ManagePromotionModal
                    promotion={item}
                    onDismiss={() => modal.close()}
                    onClose={(promotion) => {
                        let {promotions} = this.state;
                        promotionApi.update(item._id, promotion).then(() => {
                            this.setState({promotions: promotions.map(p => p._id == item._id ? promotion : p)});
                            modal.close();
                        })
                    }}
                />
            )
        })
    }

    remove(item) {
        let {promotions} = this.state;

        confirmModal.show({
            title: `Xoá chiến dịch ${item.name}?`,
            description: "Bạn có đồng ý xoá chiến dịch này không?"
        }).then(() => {
            this.setState({
                promotions: promotions.filter(p => p._id != item._id)
            });
            promotionApi.delete(item._id);
        })
    }

    render() {

        let {promotions} = this.state;

        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();

        let columns = [{
            label: "Thời Gian Áp Dụng",
            width: "40%",
            display: (item) => <span>{moment(item.from).format("DD/MM/YYYY")} - {moment(item.to).format("DD/MM/YYYY")}</span>,
            sortKey: "catalog",
            minWidth: "150"
        }, {
            label: "Tên",
            width: "40%",
            display: (row) => row.name,
            sortBy: (row) => row.name,
            minWidth: "150"
        }, {
            label: "Chiết Khấu",
            width: "15%",
            display: (row) => `${row.discount}%`,
            sortBy: (row) => row.discount,
            minWidth: "100"
        }, {
            label: "",
            width: "5%",
            display: (row) => security.isHavePermission(["promotion.edit", "promotion.remove"]) && (
                <ButtonGroup
                    actions={[{
                        name: "Sửa",
                        icon: <i className="fa fa-pencil"/>,
                        click: () => this.edit(row),
                        hide: () => !security.isHavePermission(["promotion.edit"])
                    }, {
                        name: "Xóa",
                        icon: <i className="fa fa-trash text-danger"/>,
                        click: () => this.remove(row),
                        hide: () => !security.isHavePermission(["promotion.remove"])
                    }]}
                />
            ),
            minWidth: "50"
        }];

        return (
            <Layout
                activeRoute="Chiến Dịch Khuyến Mại"

            >

                <div className="card">
                    <div className="card-title">Chiến Dịch Khuyến Mại</div>

                    <div className="card-body">
                        { security.isHavePermission(["promotion.create"]) && (
                            <button type="button" className="btn btn-primary" onClick={() => this.addItem()}>
                                Thêm chiến dịch
                            </button>
                        )}
                    </div>
                </div>

                { security.isHavePermission(["promotion.view"]) && (
                    <DataTable
                        rows={promotions}
                        columns={columns}
                    />
                )}
            </Layout>
        );
    }
}