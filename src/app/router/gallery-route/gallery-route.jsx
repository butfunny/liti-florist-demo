import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import {formatNumber, getSubTotalBill, getTotalBillWithouDiscount} from "../../common/common";
import {productApi} from "../../api/product-api";
import {userInfo} from "../../security/user-info";
import {permissionInfo} from "../../security/premises-info";
import {PermissionDenie} from "../report/revenue/revenue-report-route";
import {modals} from "../../components/modal/modals";
import {ManageGallery} from "./manage-gallery";
import {photosApi} from "../../api/photos-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {security} from "../../security/secuiry-fe";
import {ButtonGroup} from "../../components/button-group/button-group";
import {DataTable} from "../../components/data-table/data-table";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
import sumBy from "lodash/sumBy";
import {Select} from "../../components/select/select";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {SelectTags} from "../../components/select-tags/select-tags";
import {catalogs} from "../../common/constance";
import {Input} from "../../components/input/input";
const regexBreakLine = /(?:\r\n|\r|\n)/g;
import uniq from "lodash/uniq";
export class GalleryRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            filteredColors: [],
            filteredTypes: [],
            types: [],
            keyword: ""
        };



        photosApi.getPhotos().then(({photos, flowers}) => {
            let _photos = photos.map(photo => ({
                ...photo,
                items: photo.items.map((item) => {
                    let found = flowers.find(f => f._id == item.parentID);
                    if (found) return {...item, ...found};
                    return item
                }),
                title: `${photo.flowerType} ${photo.title}`
            }));


            billApi.getBillImages().then(({bills, flowers}) => {
                _photos = _photos.concat(bills.map((bill => ({
                    url: bill.image,
                    items: bill.selectedFlower.map((item) => {
                        let found = flowers.find(f => f._id == item.parentID);
                        if (found) return {...item, ...found};
                        return item
                    }),
                    title: bill.items.map((item, index) => (
                        <div key={index}>{item.flowerType} {item.name}</div>
                    )),
                    price: getSubTotalBill(bill),
                    colors: uniq(bill.items.map((item => item.color)).join(", ").split(", ")),
                    noRemove: true,
                    billItems: bill.items
                }))));

                this.setState({photos: _photos})
            });


        });

        productApi.getTypes().then((types) => {
            this.setState({types: types.map(t => t.name)})
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


        let columns = [{
            label: "Ảnh",
            width: "10%",
            display: (row) => <div className="product-image"><ImgPreview src={row.url} /></div>,
            minWidth: "100"
        }, {
            label: "Tên",
            width: "25%",
            display: (row) => row.title,
            sortBy: (row) => row.title,
            minWidth: "150"
        }, {
            label: "Định Lượng",
            width: "45%",
            display: (row) => row.items.map((product, index) => {
                return (
                    <ColumnViewMore
                        key={index}
                        header={
                            <div className="product-name">
                                <ImgPreview src={product.image}/> {product.quantity} - {product.name}
                            </div>
                        }
                        renderViewMoreBody={() => (
                            <Fragment>
                                <div className="info-item">
                                    {product.productID} - {product.catalog}
                                </div>

                                <div className="info-item">
                                    Màu:
                                    {product.colors.map((color, index) => (
                                        <div key={index}
                                             style={{
                                                 background: color,
                                                 height: "15px",
                                                 width: "25px",
                                                 display: "inline-block",
                                                 marginLeft: "5px"
                                             }}
                                        />
                                    ))}
                                </div>

                                <div className="info-item">
                                    Đơn Vị Tính: {product.unit}
                                </div>

                                { product.lengthiness && (
                                    <div className="info-item">
                                        Chiều Dài Cành Hoa: {product.lengthiness}
                                    </div>
                                )}
                            </Fragment>
                        )}
                        viewMoreText="Chi Tiết"
                        isShowViewMoreText
                    />
                )
            }),
            minWidth: "300"
        }, {
            label: "Giá",
            width: "10%",
            display: (row) => formatNumber(row.price),
            sortBy: (row) => row.price,
            minWidth: "100"
        }, {
            label: "Màu",
            width: "10%",
            display: (row) => row.colors.map((color, index) => (
                <div key={index}
                     style={{
                         background: color,
                         height: "15px",
                         width: "25px",
                         display: "inline-block",
                         marginRight: "5px"
                     }}
                />
            )),
            minWidth: "100"
        }, {
            label: "",
            width: "5%",
            display: (row) => security.isHavePermission(["gallery"]) && !row.noRemove && <button className="btn btn-danger btn-small" onClick={() => this.remove(row)}><i className="fa fa-trash"/></button>,
            sortBy: (row) => row.flowerType,
            minWidth: "50"
        }];

        let {filteredColors, filteredTypes, keyword} = this.state;

        let itemsFiltered = photos && photos.filter(i => {

            const filterKeyword = (i) => {
                let keys = ["title"];
                for (let key of keys) {
                    if (`${i.flowerType || ""}${i[key]}`.toLowerCase().indexOf(keyword.toLowerCase()) > -1) return true;
                }

                for (let item of (i.billItems || [])) {
                    if (item.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1) return true;
                }

                return false;
            };

            const filterColor = (i) => {
                if (filteredColors.length == 0) return true;

                for (let color of filteredColors) {
                    if (i.colors.indexOf(color) > -1) return true;
                }
                return false;
            };


            const filterType = (i) => {
                if (filteredTypes.length == 0) return true;
                for (let type of filteredTypes) {
                    if (i.flowerType?.toLowerCase() == type.toLowerCase()) return true;
                }

                for (let item of (i.billItems || [])) {
                    if (filteredTypes.indexOf(item.flowerType) > -1) return true;
                }
            };

            return filterKeyword(i) && filterType(i) && filterColor(i);
        });

        return (
            <Layout activeRoute="Kho Ảnh">

                <div className="card gallery-route warehouse-route products-route">
                    <div className="card-title">
                        Kho Ảnh
                    </div>

                    <div className="card-body">

                        {security.isHavePermission(["gallery"]) && <button type="button" className="btn btn-primary" onClick={() => this.addPhoto()}>Thêm ảnh</button>}

                        <div className="filter-wrapper">
                            <div className="filter-col">
                                <SelectTagsColor
                                    label="Lọc Theo Màu"
                                    tags={filteredColors}
                                    onChange={(filteredColors) => this.setState({filteredColors})}
                                />
                            </div>

                            <div className="filter-col">
                                <SelectTags
                                    label="Lọc Theo Loại"
                                    tags={filteredTypes}
                                    onChange={(filteredTypes) => this.setState({filteredTypes})}
                                    list={types}
                                    placeholder="Chọn Loại"
                                />
                            </div>
                        </div>

                        <Input
                            style={{marginBottom: "5px", marginTop: "24px"}}
                            value={keyword}
                            onChange={(e) => this.setState({keyword: e.target.value})}
                            label="Tìm kiếm"
                            info="Tên, mã, đơn vị tính"
                        />
                    </div>

                    <DataTable
                        rows={itemsFiltered}
                        columns={columns}
                    />
                </div>



            </Layout>
        );
    }
}