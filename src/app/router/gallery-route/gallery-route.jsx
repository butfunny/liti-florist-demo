import React from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import {formatNumber} from "../../common/common";
import {productApi} from "../../api/product-api";
import {userInfo} from "../../security/user-info";
import {permissionInfo} from "../../security/premises-info";
import {PermissionDenie} from "../report/revenue/revenue-report-route";
import {modals} from "../../components/modal/modals";
import {ManageGallery} from "./manage-gallery";
import {photosApi} from "../../api/photos-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
const regexBreakLine = /(?:\r\n|\r|\n)/g;
export class GalleryRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bills: [],
            types: ["Tất cả"],
            colors: ["Tất cả"],
            typeSelected: "Tất cả",
            colorSelected: "Tất cả",
            photos: []
        };

        billApi.getBillImages().then(({bills, items}) => {
            this.setState({bills, items})
        });

        photosApi.getPhotos().then((photos) => {
            this.setState({photos})
        });

        productApi.getTypes().then((types) => {
            this.setState({types: ["Tất cả"].concat(types.map(t => t.name))})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: ["Tất cả"].concat(colors.map(t => t.name))})
        });

    }

    addPhoto() {
        const modal = modals.openModal({
            content: (
                <ManageGallery
                    photo={{
                        title: "",
                        colors: [],
                        flowerType: "",
                        items: [],
                        url: ""
                    }}
                    onClose={(photo) => {
                        photosApi.createPhoto(photo).then((photo) => {
                            modal.close();
                            let {photos} = this.state;
                            this.setState({photos: photos.concat(photo)})
                        })
                    }}
                    onDismiss={() => modal.close()}
                />
            )
        })
    }

    remove(photo) {
        let {photos} = this.state;
        confirmModal.show({
            title: "Bạn muốn xoá ảnh này chứ?",
            description: "Sau khi xoá mọi dữ liệu về ảnh sẽ biến mất."
        }).then(() => {
            this.setState({photos: photos.filter(b => b._id != photo._id)});
            photosApi.removePhoto(photo._id);
        })
    }

    render() {

        let {bills} = this.state;
        let {colors, types, typeSelected, colorSelected, items, photos} = this.state;

        const user = userInfo.getUser();
        const permission = permissionInfo.getPermission();

        if (permission[user.role].indexOf("report.gallery") == -1) {
            return (
                <Layout activeRoute="Báo Cáo">
                    <PermissionDenie />
                </Layout>
            )
        }


        let billFiltered = bills.filter(bill => {
            if (typeSelected == "Tất cả") {
                return true;
            }

            for (let item of bill.items) {
                if (item.flowerType && item.flowerType == typeSelected) return true;
            }

            return false;

        });

        billFiltered = billFiltered.filter(bill => {
            if (colorSelected == "Tất cả") {
                return true;
            }

            for (let item of bill.items) {
                if (item.color && item.color == colorSelected) return true;
            }

            return false;

        });

        let photosFiltered = photos.filter(photo => {
            if (typeSelected == "Tất cả") {
                return true;
            }

            return photo.flowerType == typeSelected;
        });

        photosFiltered = photosFiltered.filter(photo => {
            if (colorSelected == "Tất cả") {
                return true;
            }
            return photo.colors.indexOf(colorSelected) > -1;

        });


        return (
            <Layout activeRoute="Kho Ảnh">

                <div className="card">
                    <div className="card-title">
                        Kho Ảnh
                    </div>

                    <div className="card-body">
                        <button type="button" className="btn btn-primary" onClick={() => this.addPhoto()}>Thêm ảnh</button>
                    </div>
                </div>

                {/*<div className="gallery-route">*/}

                    {/*<div className="ct-page-title">*/}
                        {/*<h1 className="ct-title">Kho Ảnh</h1>*/}
                    {/*</div>*/}

                    {/*<div className="margin-bottom">*/}
                    {/*</div>*/}


                    {/*<div className="form-group">*/}
                        {/*<label>Loại</label>*/}
                        {/*<select className="form-control"*/}
                                {/*value={typeSelected}*/}
                                {/*onChange={(e) => this.setState({typeSelected: e.target.value})}*/}
                        {/*>*/}
                            {/*{ types.map((type, index) => (*/}
                                {/*<option value={type} key={index}>{type}</option>*/}
                            {/*))}*/}
                        {/*</select>*/}
                    {/*</div>*/}

                    {/*<div className="form-group">*/}
                        {/*<label>Màu</label>*/}
                        {/*<select className="form-control"*/}
                                {/*value={colorSelected}*/}
                                {/*onChange={(e) => this.setState({colorSelected: e.target.value})}*/}
                        {/*>*/}
                            {/*{ colors.map((type, index) => (*/}
                                {/*<option value={type} key={index}>{type}</option>*/}
                            {/*))}*/}
                        {/*</select>*/}
                    {/*</div>*/}

                    {/*<div className="row">*/}

                        {/*<div className="form-group col-md-12">*/}
                            {/*<b className="control-label">*/}
                                {/*Danh mục ảnh đã tải*/}
                            {/*</b>*/}
                        {/*</div>*/}

                        {/*{ photosFiltered.map((photo, index) => (*/}
                            {/*<div className="col-lg-4 col-md-6" key={index}>*/}
                                {/*<div className="bill-item">*/}
                                    {/*<div className="image-header">*/}
                                        {/*<img src={photo.url} alt=""/>*/}
                                    {/*</div>*/}
                                    {/*<div className="bill-body">*/}
                                        {/*{photo.flowerType} - { photo.title}*/}
                                        {/*<div>*/}
                                            {/*<b>Màu: </b> {photo.colors.join(", ")}*/}
                                        {/*</div>*/}
                                        {/*<div>*/}
                                            {/*<b>Định lượng: </b>*/}

                                            {/*<div dangerouslySetInnerHTML={{__html: photo.note.replace(regexBreakLine, "<br/>")}}/>*/}
                                        {/*</div>*/}
                                    {/*</div>*/}
                                {/*</div>*/}

                                {/*<button className="btn btn-outline-danger btn-sm"*/}
                                        {/*onClick={() => this.remove(photo)}>*/}
                                    {/*<i className="fa fa-trash"/>*/}
                                {/*</button>*/}
                            {/*</div>*/}
                        {/*))}*/}

                        {/*<div className="form-group col-md-12">*/}
                            {/*<b className="control-label">*/}
                                {/*Danh mục hoá đơn có ảnh*/}
                            {/*</b>*/}
                        {/*</div>*/}

                        {/*{ billFiltered.map((bill, index) => (*/}
                            {/*<div className="col-lg-4 col-md-6" key={index}>*/}
                                {/*<div className="bill-item">*/}
                                    {/*<div className="image-header">*/}
                                        {/*<img src={bill.image} alt=""/>*/}
                                    {/*</div>*/}
                                    {/*<div className="bill-body">*/}
                                        {/*{ bill.items.map((item, index) => (*/}
                                            {/*<div key={index}>*/}
                                                {/*{item.flowerType} {item.name} - <b>{formatNumber(item.price)}</b>*/}
                                            {/*</div>*/}
                                        {/*))}*/}

                                        {/*<div>*/}
                                            {/*<b>Nguyên liệu: </b>*/}

                                            {/*{bill.selectedFlower.map((b, index) => (*/}
                                                {/*<div key={index}>*/}
                                                    {/*{b.quantity} - {items.find(item => b.itemID == item._id).name} - {formatNumber(b.price)}*/}
                                                {/*</div>*/}
                                            {/*))}*/}
                                        {/*</div>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                        {/*))}*/}


                    {/*</div>*/}
                {/*</div>*/}
            </Layout>
        );
    }
}