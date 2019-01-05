import React from "react";
import {Layout} from "../../components/layout/layout";
import {shopApi} from "../../api/shop-api";
import {modals} from "../../components/modal/modals";
import {ManagePremisesModal} from "./manage-premises-modal";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {premisesInfo} from "../../security/premises-info";
import {DataTable} from "../../components/data-table/data-table";

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


        let columns = [{
            label: "Tên Cơ Sở",
            width: "45%",
            display: (row) => row.name,
            sortBy: (row) => row.name,
            minWidth: "150"
        }, {
            label: "Địa Chỉ",
            width: "45%",
            display: (row) => row.address,
            sortBy: (row) => row.address,
            minWidth: "300"
        }, {
            label: "",
            width: "10%",
            display: (row) => <div className="text-right"><button className="btn btn-danger btn-small" onClick={() => this.removeColor(row)}><i className="fa fa-trash"/></button></div>,
            className: "number content-menu-action",
            minWidth: "60"
        }];


        return (
            <Layout
                activeRoute="Quản Lý Cơ Sở"
            >
                <div className="card">
                    <div className="card-title">
                        Danh sách cơ sở
                    </div>

                    <div className="card-body">
                        <button type="button" className="btn btn-primary" onClick={() => this.addPremises()}>Thêm Cơ Sở</button>
                    </div>

                    <DataTable
                        rows={premises}
                        columns={columns}
                    />
                </div>



                {/*<table className="table table-hover">*/}
                    {/*<thead>*/}
                    {/*<tr>*/}
                        {/*<th scope="col">Tên Cơ Sở</th>*/}
                        {/*<th scope="col">Tác Vụ</th>*/}
                    {/*</tr>*/}
                    {/*</thead>*/}
                    {/*<tbody>*/}
                    {/*{ premises && premises.map((item, index) => (*/}
                        {/*<tr key={index}>*/}
                            {/*<td>{item.name} <br/> <small className="text-sm-left"> {item.address} - {item.phone}</small></td>*/}
                            {/*<td>*/}
                                {/*<button className="btn btn-outline-primary btn-sm" onClick={() => this.editPremises(item)}>*/}
                                    {/*<i className="fa fa-pencil"/>*/}
                                {/*</button>*/}
                                {/*/!*{ premises.length > 1 && (*!/*/}
                                {/*/!*<button className="btn btn-outline-danger btn-sm" onClick={() => this.remove(item)}>*!/*/}
                                {/*/!*<i className="fa fa-trash"/>*!/*/}
                                {/*/!*</button>*!/*/}
                                {/*/!*)}*!/*/}
                            {/*</td>*/}
                        {/*</tr>*/}
                    {/*))}*/}
                    {/*</tbody>*/}
                {/*</table>*/}
            </Layout>
        );
    }
}