import React from "react";
import {Layout} from "../../components/layout/layout";
import {modals} from "../../components/modal/modals";
import {ManageProductModal} from "./manage-product-modal";
export class ProductsRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    addProduct() {
        const modal = modals.openModal({
            content: (
                <ManageProductModal
                    product={{
                        catalog: "Hoa Chính",
                        oriPrice: 0,
                        price: 0
                    }}
                    onDismiss={() => modal.close()}
                    onClose={() => {
                        modal.close();
                        // this.refresh();
                    }}
                />
            )
        })
    }

    render() {
        return (
            <Layout
                activeRoute="Danh Sách Sản Phẩm"
            >
                <div className="products-route card">
                    <div className="card-title">
                        Sản Phẩm
                    </div>

                    <div className="card-body">
                        <button type="button" className="btn btn-primary" onClick={() => this.addProduct()}>Thêm Sản Phẩm</button>
                    </div>
                </div>
            </Layout>
        );
    }
}