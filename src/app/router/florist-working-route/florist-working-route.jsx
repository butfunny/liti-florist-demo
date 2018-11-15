import React from "react";
import {Layout} from "../../components/layout/layout";
import {billApi} from "../../api/bill-api";
import classnames from "classnames";
import {warehouseApi} from "../../api/warehouse-api";
import {premisesInfo} from "../../security/premises-info";
import {InputNumber} from "../../components/input-number/input-number";
import {FloristItem} from "./florist-item";
import {FloristCartBottom} from "./cart/florist-cart-bottom";
export class FloristWorkingRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bill: null,
            items: []
        };

        billApi.getBillById(props.match.params.id).then((bill) => {
            this.setState({bill})
        });


        warehouseApi.getItemsById(premisesInfo.getActivePremise()._id).then((items) => {
            this.setState({items})
        })
    }

    render() {

        let {bill, items} = this.state;

        return (
            <Layout
                customerClass="florist-container"
            >
                <div className="florist-working-route">

                    <div className="catalog-list">

                        <div className="catalog-item text-primary">
                           ALL
                        </div>

                        <div className="catalog-item">
                            HOA CHÍNH
                        </div>

                        <div className="catalog-item">
                            Hoa Lá Phụ/Lá
                        </div>

                        <div className="catalog-item">
                            Phụ Kiện
                        </div>

                        <div className="catalog-item">
                            COST
                        </div>
                    </div>

                    <div className="search-item">
                        <input className="form-control" placeholder="Tìm"/>
                    </div>

                    <div className="product-list">
                        <FloristItem
                            label="Hoa Chính"
                            className="hoa-chinh"
                            items={items.filter(i => i.catalog == "Hoa Chính")}
                        />

                        <FloristItem
                            label="Hoa Lá Phụ/Lá"
                            className="hoa-phu"
                            items={items.filter(i => i.catalog == "Hoa Lá Phụ/Lá")}
                        />

                        <FloristItem
                            label="Phụ Kiện"
                            className="phu-kien"
                            items={items.filter(i => i.catalog == "Phụ Kiện")}
                        />

                        <FloristItem
                            label="Cost"
                            className="hoa-chinh"
                            items={items.filter(i => i.catalog == "Cost")}
                        />
                    </div>

                    { bill && (
                        <FloristCartBottom
                            bill={bill}
                        />
                    )}
                </div>
            </Layout>
        );
    }
}