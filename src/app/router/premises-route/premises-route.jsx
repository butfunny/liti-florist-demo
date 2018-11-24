import React from "react";
import {Layout} from "../../components/layout/layout";
import {shopApi} from "../../api/shop-api";
import {modals} from "../../components/modal/modals";
import {ManagePremisesModal} from "./manage-premises-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {premisesInfo} from "../../security/premises-info";

export class PremisesRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            premises: premisesInfo.getPremises()
        };
    }

    addPremises() {
        let {premises} = this.state;

        const handleClose = (item) => {
            shopApi.create(item).then((newItem) => {
                let updated = premises.concat(newItem);
                premisesInfo.updatePremises(updated);

                this.setState({
                    premises: updated
                });
            })
        };

        const modal = modals.openModal({
            content: (
                <ManagePremisesModal
                    content={{name: ""}}
                    onClose={(item) => {modal.close(); handleClose(item)}}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    editPremises(content) {
        let {premises} = this.state;

        const handleClose = (item) => {
            shopApi.update(content._id, item).then(() => {
                let updated = premises.map(p => {
                    if (p._id == content._id) return {...p, ...item};
                    return p;
                });
                premisesInfo.updatePremises(updated);
                this.setState({
                    premises: updated
                });
            })
        };

        const modal = modals.openModal({
            content: (
                <ManagePremisesModal
                    content={content}
                    onClose={(item) => {modal.close(); handleClose(item)}}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    remove(content) {

        let {premises} = this.state;

        confirmModal.show({
            title: `Xoá cơ sở ${content.name}?`,
            description: "Bạn có đồng ý xoá cơ sở này không? Mọi hoá đơn của cơ sở này sẽ bị mất"
        }).then(() => {
            let updated = premises.filter(p => p._id != content._id);
            premisesInfo.updatePremises(updated);
            this.setState({
                premises: updated
            });
            shopApi.delete(content._id);
        })
    }

    render() {

        let {premises} = this.state;

        return (
            <Layout
                activeRoute="Cài Đặt"
            >
                <div className="manage-premises-route">
                    <div className="ct-page-title">
                        <h1 className="ct-title">Quản Lý Cơ Sở</h1>
                        <div className="avatar-group mt-3">
                        </div>
                    </div>

                    <p className="ct-lead">
                        Thêm mới chỉnh sửa hoặc xoá các cơ sở hiện hành
                    </p>

                    <hr/>

                    <div className="margin-bottom">
                        <button type="button" className="btn btn-info" onClick={() => this.addPremises()}>Thêm Cơ Sở</button>
                    </div>


                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col">Tên Cơ Sở</th>
                            <th scope="col">Tác Vụ</th>
                        </tr>
                        </thead>
                        <tbody>
                        { premises && premises.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name} <br/> <small className="text-sm-left"> {item.address} - {item.phone}</small></td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => this.editPremises(item)}>
                                        <i className="fa fa-pencil"/>
                                    </button>
                                    { premises.length > 1 && (
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => this.remove(item)}>
                                            <i className="fa fa-trash"/>
                                        </button>
                                    )}
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