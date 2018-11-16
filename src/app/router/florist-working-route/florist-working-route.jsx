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
            items: [],
            keyword: "",
            filter: "All",
            selectedItems: []
        };

        billApi.getBillById(props.match.params.id).then((bill) => {
            this.setState({bill})
        });


        warehouseApi.getItemsById(premisesInfo.getActivePremise()._id).then((items) => {
            this.setState({items})
        })
    }

    render() {

        let {bill, items, keyword, filter, selectedItems} = this.state;

        const catalogs = ["All", "Hoa Chính", "Hoa Lá Phụ/Lá", "Phụ Kiện", "Cost"];

        return (
            <Layout
                customerClass="florist-container"
            >
                <div className="florist-working-route">

                    <div className="catalog-list">

                        { catalogs.map((c, index) => (
                            <div className={classnames("catalog-item", c == filter && "text-primary")}
                                 onClick={() => this.setState({filter: c})}
                                 key={index}>
                                {c}
                            </div>
                        ))}

                    </div>

                    <div className="search-item">
                        <input className="form-control"
                               value={keyword}
                               onChange={(e) => this.setState({keyword: e.target.value})}
                               placeholder="Tìm"/>
                    </div>

                    <div className="product-list">

                        { catalogs.slice(1).filter(c => filter == "All" ? true : c == filter).map((c, index) => (
                            <FloristItem
                                selectedItems={selectedItems}
                                onChange={(selectedItems) => this.setState({selectedItems})}
                                keyword={keyword}
                                key={index}
                                label={c}
                                items={items.filter(i => i.catalog == c)}
                            />
                        ))}

                    </div>

                    { bill && (
                        <FloristCartBottom
                            selectedItems={selectedItems}
                            onChange={(selectedItems) => this.setState({selectedItems})}
                            bill={bill}
                            items={items}
                        />
                    )}
                </div>
            </Layout>
        );
    }
}