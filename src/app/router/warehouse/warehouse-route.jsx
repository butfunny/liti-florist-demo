import React, {Fragment} from "react";
import {Layout} from "../../components/layout/layout";
import {premisesInfo} from "../../security/premises-info";
import {Select} from "../../components/select/select";
import {warehouseApi} from "../../api/warehouse-api";
import {ImgPreview} from "../../components/img-repview/img-preview";
import {formatNumber} from "../../common/common";
import {ButtonGroup} from "../../components/button-group/button-group";
import {DataTable} from "../../components/data-table/data-table";
import sortBy from "lodash/sortBy";
import {Input} from "../../components/input/input";
import {SelectTagsColor} from "../../components/select-tags-color/select-tags-color";
import {SelectTags} from "../../components/select-tags/select-tags";
import {catalogs} from "../../common/constance";
import {productApi} from "../../api/product-api";
import {security} from "../../security/secuiry-fe";
import moment from "moment";
import minBy from "lodash/minBy";
import maxBy from "lodash/maxBy";
import {DatePicker} from "../../components/date-picker/date-picker";
import {ColumnViewMore} from "../../components/column-view-more/column-view-more";
export class WarehouseRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: null,
            selectedBase: "all",
            keyword: "",
            filteredColors: [],
            filteredTypes: [],
            suppliers: [],
            from: null,
            to: null
        };

        productApi.suppliers().then((suppliers) => this.setState({suppliers}))
    }

    componentDidMount() {
        this.loadData("all").then((products) => {
            this.setState({
                from: new Date(minBy(products, p => new Date(p.created).getTime()).created),
                to: new Date(maxBy(products, p => new Date(p.created).getTime()).created)
            })
        });
    }

    loadData(baseID) {
        this.setState({items: null});
        if (baseID == "all") {
            return warehouseApi.searchProductInBase("").then(({products, flowers}) => {
                this.setState({items: products.map(p => {
                        let flower = flowers.find(f => f._id == p.parentID);
                        return {
                            ...flower,
                            ...p
                        }
                    })
                });
                return Promise.resolve(products);
            })
        } else {
            return warehouseApi.searchProductInSubWarehouse({keyword: "", premisesID: baseID}).then(({products, flowers}) => {
                this.setState({items: products.map(p => {
                        let flower = flowers.find(f => f._id == p.parentID);
                        return {
                            ...flower,
                            ...p
                        }
                    })
                });
                return Promise.resolve();
            })
        }
    }

    // handleChangeInput(e) {
    //     if (e.target.files[0]) {
    //         readXlsxFile(e.target.files[0]).then((rows) => {
    //             if (rows[0] && isEqual(["Mã", "Tên hàng", "Danh mục", "Đơn vị tính", "Số lượng", "Giá gốc", "Giá bán", "Màu sắc", "Nhà cung cấp", "Xuất xứ"], rows[0])) {
    //                 this.setState({uploading: true});
    //
    //                 const upload = (index) => {
    //                     if (index == rows.length - 1) {
    //                         this.setState({uploading: false});
    //                         confirmModal.alert(`Thêm thành công ${rows.length - 1} sản phẩm`);
    //                         warehouseApi.getItems().then(({warehouseItems, subWarehouseItems}) => {
    //                             this.setState({items: warehouseItems, subWarehouseItems, loading: false})
    //                         })
    //                     } else {
    //                         let item = rows[index];
    //                         warehouseApi.createItem({
    //                             productId: item[0],
    //                             name: item[1],
    //                             catalog: item[2],
    //                             unit: item[3],
    //                             oriPrice: item[5],
    //                             price: item[6],
    //                             quantity: item[4],
    //                             color: item[7],
    //                             supplier: item[8],
    //                             country: item[9]
    //                         }).then(() => {
    //                             upload(index + 1)
    //                         })
    //                     }
    //                 };
    //
    //                 upload(1);
    //
    //             } else {
    //                 confirmModal.alert("Sai định dạng file");
    //             }
    //         })
    //     }
    // }

    render() {


        let premises = premisesInfo.getPremises();

        let columns = [{
            label: "Ngày Nhập Kho",
            width: "10%",
            display: (row) => moment(row.created).format("DD/MM/YYYY hh:MM"),
            sortBy: (row) => row.created,
            minWidth: "150"
        }, {
            label: "Tên",
            width: "25%",
            display: (row) => (

                <ColumnViewMore
                    header={(
                        <div className="product-name">
                            <ImgPreview src={row.image}/> {row.name}
                        </div>
                    )}
                    isShowViewMoreText
                    renderViewMoreBody={() => (
                        <Fragment>
                            <div className="info-item">
                                Màu: { row.colors.map((color, index) => (
                                <div key={index}
                                     style={{
                                         background: color,
                                         height: "15px",
                                         width: "25px",
                                         display: "inline-block",
                                         marginRight: "5px"
                                     }}
                                />
                            )) }
                            </div>

                            <div className="info-item">
                                Đơn Vị Tính: {row.unit}
                            </div>

                            <div className="info-item">
                                Dài: {row.lengthiness}
                            </div>
                        </Fragment>
                    )}
                />


            ),
            sortBy: (row) => row.name,
            minWidth: "250"
        }, {
            label: "Tồn",
            width: "5%",
            display: (row) => row.quantity,
            sortBy: (row) => row.quantity,
            minWidth: "50"
        }, {
            label: "Loại",
            width: "15%",
            display: (row) => row.catalog,
            sortBy: (row) => row.catalog,
            minWidth: "100"
        }, {
            label: "NCC",
            width: "15%",
            display: (row) => this.state.suppliers.find(s => s._id == row.supplierID).name,
            minWidth: "100"
        }, {
            label: "Giá Gốc",
            width: "10%",
            display: (row) => security.isHavePermission(["warehouse.view-ori-price"]) && formatNumber(row.oriPrice),
            sortBy: security.isHavePermission(["warehouse.view-ori-price"]) ? (row) => row.oriPrice : null,
            minWidth: "100"
        }, {
            label: "Giá Bán",
            width: "10%",
            display: (row) => formatNumber(row.price),
            sortBy: (row) => row.price,
            minWidth: "100"
        }, {
            label: "Tổng Tồn",
            width: "10%",
            display: (row) => formatNumber(row.price * row.quantity),
            sortBy: (row) => row.price * row.quantity,
            minWidth: "100",
        }];


        let {selectedBase, keyword, filteredColors, filteredTypes, items, from, to} = this.state;


        let bases = [{
            value: "all",
            label: "Kho Tổng"
        }, ...premises.map((p) => ({
            value: p._id,
            label: `Kho ${p.name}`
        }))];


        let itemsFiltered = items && items.filter(i => {

            const filterKeyword = (i) => {
                let keys = ["productID", "name", "unit"];
                for (let key of keys) {
                    if (i[key].toLowerCase().indexOf(keyword.toLowerCase()) > -1) return true;
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
                    if (i.catalog.toLowerCase() == type.toLowerCase()) return true;
                }
            };

            const filterDateTime = (i) => {
                let dateFrom = new Date(from);
                dateFrom.setHours(0, 0,0 ,0);

                let dateTo = new Date(to);
                dateTo.setHours(23, 59, 59, 99);
                return new Date(i.created).getTime() >= dateFrom.getTime() && new Date(i.created).getTime() <= dateTo.getTime();

            };


            return filterKeyword(i) && filterType(i) && filterColor(i) && filterDateTime(i);
        });

        return (
            <Layout
                activeRoute="Tồn Kho"
            >
                <div className="warehouse-route products-route">
                    <div className="card">
                        <div className="card-title">
                            Tồn Kho
                        </div>

                        <div className="card-body">
                            <Select
                                label="Kho"
                                className="first-margin"
                                value={selectedBase}
                                list={bases.map(b => b.value)}
                                displayAs={(base) => bases.find(b => b.value == base).label}
                                onChange={(selectedBase) => {
                                    this.setState({selectedBase});
                                    this.loadData(selectedBase)
                                }}
                            />

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
                                        list={catalogs}
                                        placeholder="Chọn Loại"
                                    />
                                </div>
                            </div>

                            { from && (
                                <div className="filter-wrapper">
                                    <div className="filter-col">
                                        <DatePicker
                                            label="Từ ngày"
                                            value={from}
                                            onChange={(from) => this.setState({from})}
                                        />
                                    </div>

                                    <div className="filter-col">
                                        <DatePicker
                                            label="Tới ngày"
                                            value={to}
                                            onChange={(to) => this.setState({to})}
                                        />
                                    </div>
                                </div>
                            )}



                            <Input
                                style={{marginBottom: "5px", marginTop: "24px"}}
                                value={keyword}
                                onChange={(e) => this.setState({keyword: e.target.value})}
                                label="Tìm kiếm"
                                info="Tên, mã, đơn vị tính"
                            />
                        </div>

                        <DataTable
                            rows={sortBy(itemsFiltered, i => i.created)}
                            columns={columns}
                        />
                    </div>
                </div>

            </Layout>
        );
    }
}