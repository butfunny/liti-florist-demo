import React from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import {formatNumber} from "../../common/common";
import {productApi} from "../../api/product-api";
export class GalleryRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bills: [],
            types: ["Tất cả"],
            colors: ["Tất cả"],
            typeSelected: "Tất cả",
            colorSelected: "Tất cả"
        };

        billApi.getBillImages().then((bills) => {
            this.setState({bills})
        });

        productApi.getTypes().then((types) => {
            this.setState({types: ["Tất cả"].concat(types.map(t => t.name))})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: ["Tất cả"].concat(colors.map(t => t.name))})
        });
    }

    render() {

        let {bills} = this.state;
        let {colors, types, typeSelected, colorSelected} = this.state;


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

        return (
            <Layout activeRoute="Báo Cáo">
                <div className="gallery-route">

                    <div className="ct-page-title">
                        <h1 className="ct-title">Kho Ảnh</h1>
                    </div>


                    <div className="form-group">
                        <label>Loại</label>
                        <select className="form-control"
                                value={typeSelected}
                                onChange={(e) => this.setState({typeSelected: e.target.value})}
                        >
                            { types.map((type, index) => (
                                <option value={type} key={index}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Màu</label>
                        <select className="form-control"
                                value={colorSelected}
                                onChange={(e) => this.setState({colorSelected: e.target.value})}
                        >
                            { colors.map((type, index) => (
                                <option value={type} key={index}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row">

                        { billFiltered.map((bill, index) => (
                            <div className="col-lg-4 col-md-6" key={index}>
                                <div className="bill-item">
                                    <div className="image-header">
                                        <img src={bill.image} alt=""/>
                                    </div>
                                    <div className="bill-body">
                                        { bill.items.map((item, index) => (
                                            <div key={index}>
                                                {item.flowerType} {item.name} - <b>{formatNumber(item.price)}</b>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}


                    </div>
                </div>
            </Layout>
        );
    }
}