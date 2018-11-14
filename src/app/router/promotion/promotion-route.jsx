import React from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManagePromotionModal} from "./manage-promotion-modal";
import {promotionApi} from "../../api/promotion-api";
import moment from "moment";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {securityApi} from "../../api/security-api";
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
        const modal = modals.openModal({
            content: (
                <ManagePromotionModal
                    promotion={{dates: [new Date()], name: "", discount: 0}}
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
        })
    }

    render() {

        let {promotions} = this.state;

        return (
            <Layout
                activeRoute="Khuyến Mại">
                <div className="promotion-route manage-premises-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Chiến dịch quảng cáo</h1>
                        <div className="avatar-group mt-3">
                        </div>
                    </div>
                    <hr/>
                    <div className="margin-bottom">
                        <button type="button" className="btn btn-primary" onClick={() => this.addItem()}>
                            Thêm chiến dịch
                        </button>
                    </div>

                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Thông Tin</th>
                            <th scope="col">Các Ngày Áp Dụng</th>
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
                                    <ul>
                                        { item.dates.map((date, index) => (
                                            <li key={index}>{moment(date).format("DD/MM/YYYY")}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm"
                                            onClick={() => this.edit(item)}>
                                        <i className="fa fa-pencil"/>
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm"
                                            onClick={() => this.remove(item)}>
                                        <i className="fa fa-trash"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Layout>
        );
    }
}