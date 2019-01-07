import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManageVipModal} from "./manage-vip-modal";
import {vipApi} from "../../api/vip-api";
import moment from "moment";
import {Input} from "../../components/input/input";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {securityApi} from "../../api/security-api";
import {Checkbox} from "../../components/checkbox/checkbox";
import {userInfo} from "../../security/user-info";
import {permissionInfo} from "../../security/premises-info";
import {LoadingOverlay} from "../../components/loading-overlay/loading-overlay";
import {formatNumber} from "../../common/common";
import {Pagination} from "../../components/pagination/pagination";
import {ChangeEndDateModal} from "./change-end-date-modal";
import {ButtonGroup} from "../../components/button-group/button-group";
import {DataTable} from "../../components/data-table/data-table";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
export class VipRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            vips: null,
            customers: null,
            keyword: "",
            filterBirthDay: false
        };

        vipApi.getVipList().then(({customers, vips}) => this.setState({vips, customers}))
    }

    addVip() {
        const modal = modals.openModal({
            content: (
                <ManageVipModal
                    onDismiss={() => modal.close()}
                    onClose={({vip, customer}) => {
                        let {vips, customers} = this.state;
                        this.setState({vips: vips.concat(vip), customers: customers.concat(customer)});
                        modal.close();
                    }}
                />
            )
        })
    }

    remove(vip) {
        confirmModal.show({
            title: `Xoá khách vip?`,
            description: "Bạn có đồng ý xoá quyền lợi vip của khách này không?"
        }).then(() => {
            vipApi.removeVIP(vip._id);
            let {vips} = this.state;
            this.setState({
                vips: vips.filter(v => v._id != vip._id)
            })
        })
    }

    edit(vip) {
        const modal = modals.openModal({
            content: (
                <ChangeEndDateModal
                    vip={vip}
                    onDismiss={() => modal.close()}
                    onClose={(endDate) => {
                        let {vips} = this.state;
                        this.setState({
                            vips: vips.map(v => v._id == vip._id ? ({...v, endDate}) : v)
                        });
                        modal.close();
                    }}
                />
            )
        })
    }

    render() {

        let {vips, customers, keyword, filterBirthDay} = this.state;

        const getCustomer = (customerID) => customers.find(c => c._id == customerID);
        let today = new Date();

        const vipsFiltered = vips && vips.filter((vip) => {
            let customer = getCustomer(vip.customerId);

            if (filterBirthDay) {
                if (!customer.birthDate) return false;
                let customerBirthDay = new Date(customer.birthDate);
                if (customerBirthDay.getMonth() != today.getMonth()) {
                    return false;
                }
            }

            return vip.cardId.toLowerCase().indexOf(keyword.toLowerCase()) > - 1 ||
            customer.customerName.toLowerCase().indexOf(keyword.toLowerCase()) > - 1 ||
            customer.customerPhone.toLowerCase().indexOf(keyword.toLowerCase()) > - 1
        });

        let columns = [{
            label: "Khách Hàng",
            width: "40%",
            sortBy: (row) => getCustomer(row.customerId).customerName,
            display: (row) => {
                let customer = getCustomer(row.customerId);
                return (
                    <ColumnViewMore
                        header={customer.customerName}
                        renderViewMoreBody={() => (
                            <Fragment>
                                <div className="info-item">Địa chỉ: <b>{customer.customerPlace}</b></div>
                                <div className="info-item">Email: <b>{customer.email}</b></div>
                                <div className="info-item">Sở Thích: <b>{customer.hobby}</b></div>
                                <div className="info-item">Ghi chú: <b>{customer.notes}</b></div>
                                <div className="info-item">Cơ sở mua hàng: <b>{customer.premises.join(", ")}</b></div>
                                <div className="info-item">Kênh mua hàng: <b>{customer.buyerFrom.join(", ")}</b></div>
                                { customer.birthDate && <div>Ngày Sinh: <b>{moment(new Date(customer.birthDate)).format("DD/MM/YYYY")}</b></div>}
                            </Fragment>
                        )}
                        subText={`Số Điện Thoại: ${customer.customerPhone}`}
                    />
                )
            },
            minWidth: "150"
        }, {
            label: "Số Thẻ",
            width: "20%",
            sortBy: (row) => row.cardId,
            display: (row) => <span>6666 {row.cardId.toString().substr(0, 4) + " " + row.cardId.toString().substr(4, 7)}</span>,
            minWidth: "150"
        }, {
            label: "Loại Thẻ",
            width: "10%",
            display: (row) => row.vipType,
            sortBy: (row) => row.vipType,
            minWidth: "100"
        }, {
            label: "Ngày Phát Hành",
            width: "15%",
            display: (row) => moment(new Date(row.created)).format("DD/MM/YYYY"),
            sortBy: (row) => row.created,
            minWidth: "100"
        }, {
            label: "Ngày Hết Hạn",
            width: "15%",
            display: (row) => moment(new Date(row.endDate)).format("DD/MM/YYYY"),
            sortBy: (row) => row.endDate,
            minWidth: "100"
        }, {
            label: "",
            width: "5%",
            display: (row) => (
                <ButtonGroup
                    actions={[{
                        name: "Sửa",
                        icon: <i className="fa fa-pencil-square-o"/>,
                        click: () => this.edit(row)
                    }, {
                        name: "Xóa",
                        icon: <i className="fa fa-trash text-danger"/>,
                        click: () => this.remove(row)
                    }]}
                />
            ),
            minWidth: "50"
        }];



        return (
            <Layout
                activeRoute="VIP"
            >

                <div className="card vip-route">
                    <div className="card-title">
                        Danh sách VIP
                    </div>

                    <div className="card-body">
                        <div className="margin-bottom">
                            <button type="button" className="btn btn-primary" onClick={() => this.addVip()}>Thêm khách VIP</button>
                        </div>

                        <Input
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            label="Tìm Kiếm theo tên, số điện thoại, hoặc số thẻ"
                        />

                        <Checkbox
                            label="Lọc khách VIP có sinh nhật trong tháng"
                            value={filterBirthDay}
                            onChange={(filterBirthDay) => this.setState({filterBirthDay})}
                        />
                    </div>

                    <DataTable
                        rows={vips ? vipsFiltered: null}
                        columns={columns}
                    />
                </div>

                {/*<div className="manage-premises-route manage-user-route">*/}
                    {/*<div className="ct-page-title">*/}
                        {/*<h1 className="ct-title">Quản lý khách hàng VIP</h1>*/}
                        {/*<div className="avatar-group mt-3">*/}
                        {/*</div>*/}
                    {/*</div>*/}

                    {/*<hr/>*/}



                    {/*<div className="form-group">*/}

                    {/*</div>*/}



                    {/*<table className="table table-hover">*/}
                        {/*<thead>*/}
                        {/*<tr>*/}
                            {/*<th scope="col">Thông Tin Khách</th>*/}
                            {/*<th scope="col">Loại VIP</th>*/}
                            {/*<th scope="col">Tác Vụ</th>*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*{vips && vipsFiltered.map((item, index) => {*/}

                            {/*let customer = getCustomer(item.customerId);*/}

                            {/*return (*/}
                                {/*<tr key={index}>*/}
                                    {/*<td>*/}


                                        {/*<div>*/}
                                            {/*Người lập: <b>{item.createdBy ? item.createdBy.username : ""}</b>*/}
                                        {/*</div>*/}
                                        {/*<div>*/}
                                            {/*Ngày phát hành: <b>{moment(new Date(item.created)).format("DD/MM/YYYY")}</b>*/}
                                        {/*</div>*/}
                                        {/*<div>*/}
                                            {/*Ngày hết hạn: <b>{moment(new Date(item.endDate)).format("DD/MM/YYYY")}</b>*/}
                                        {/*</div>*/}
                                    {/*</td>*/}

                                    {/*<td*/}
                                        {/*style={{minWidth: "200px"}}*/}
                                    {/*>*/}
                                        {/*{item.vipType}*/}
                                    {/*</td>*/}
                                    {/*<td*/}
                                        {/*style={{minWidth: "150px"}}*/}
                                    {/*>*/}

                                        {/*<button className="btn btn-outline-primary btn-sm"*/}
                                                {/*onClick={() => this.edit(item)}>*/}
                                            {/*<i className="fa fa-edit"/>*/}
                                        {/*</button>*/}

                                        {/*<button className="btn btn-outline-danger btn-sm"*/}
                                                {/*onClick={() => this.remove(item)}>*/}
                                            {/*<i className="fa fa-trash"/>*/}
                                        {/*</button>*/}
                                    {/*</td>*/}
                                {/*</tr>*/}
                            {/*)*/}
                        {/*})}*/}
                        {/*</tbody>*/}
                    {/*</table>*/}

                {/*</div>*/}

            </Layout>
        );
    }
}

