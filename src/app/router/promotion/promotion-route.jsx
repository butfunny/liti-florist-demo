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

        return (
            <Layout
                activeRoute="Hình Thức Khuyến Mại">
                { !permission[user.role].find(r => r.indexOf("promotion") == 0) ? (
                    <div>
                        Bạn không có quyền truy cập vào trang này vui lòng chọn những trang bạn có quyền trên thanh nav
                    </div>
                ) : (
                    <div className="promotion-route manage-premises-route">
                        <div className="ct-page-title">
                            <h1 className="ct-title">Chiến dịch quảng cáo</h1>
                            <div className="avatar-group mt-3">
                            </div>
                        </div>
                        <hr/>
                        { permission[user.role].indexOf("promotion.create") > -1 && (
                            <div className="margin-bottom">
                                <button type="button" className="btn btn-info" onClick={() => this.addItem()}>
                                    Thêm chiến dịch
                                </button>
                            </div>
                        )}

                        { permission[user.role].indexOf("promotion.view") > -1 && (
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th scope="col">Thông Tin</th>
                                    <th scope="col">Ngày Áp Dụng</th>
                                    <th scope="col">Tác Vụ</th>
                                </tr>
                                </thead>
                                <tbody>
                                {promotions && promotions.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <b>{item.name}</b>
                                            <div className="text-danger">
                                                Giảm: {item.discount}%
                                            </div>
                                        </td>
                                        <td>
                                            {moment(item.from).format("DD/MM/YYYY")} - {moment(item.to).format("DD/MM/YYYY")}
                                        </td>
                                        <td>

                                            { permission[user.role].indexOf("promotion.edit") > -1 && (
                                                <button className="btn btn-outline-primary btn-sm"
                                                        onClick={() => this.edit(item)}>
                                                    <i className="fa fa-pencil"/>
                                                </button>
                                            )}

                                            { permission[user.role].indexOf("promotion.remove") > -1 && (
                                                <button className="btn btn-outline-danger btn-sm"
                                                        onClick={() => this.remove(item)}>
                                                    <i className="fa fa-trash"/>
                                                </button>
                                            )}

                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}



                    </div>
                )}

            </Layout>
        );
    }
}