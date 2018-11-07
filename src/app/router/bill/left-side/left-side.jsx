import React, {Fragment} from "react";
import {BillAddItem} from "./add/bill-add-item";
import {BillCatalog} from "./catalog/bill-catalog";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {productApi} from "../../../api/product-api";
import {premisesInfo} from "../../../security/premises-info";
export class LeftSide extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            catalogs: []
        };

        productApi.get().then((catalogs) => {
            this.setState({catalogs})
        });

        premisesInfo.onChange(() => {
            this.setState({catalogs: []});
            productApi.get().then((catalogs) => {
                this.setState({catalogs})
            });
        })
    }

    addItem({name, price}) {
        let {items, onChangeItems} = this.props;
        let found = items.find(item => item.name == name);
        if (found) {
            onChangeItems(items.map(item => {
                if (item.name == name) {
                    return {...item, qty: item.qty + 1}
                }

                return item;
            }))
        } else {
            onChangeItems(items.concat({
                name, price, qty: 1
            }))
        }

    }

    addCatalog({name, price}) {
        let {catalogs} = this.state;
        let found = catalogs.find(c => c.name == name);

        if (found) {
            confirmModal.alert("Sản phẩm đã được thêm rồi");
        } else {
            this.setState({saving: true});
            productApi.create({name, price}).then((catalog) => {
                this.setState({saving: false});
                this.setState({catalogs: catalogs.concat(catalog)})
            });
        }
    }

    render() {

        let {saving, catalogs} = this.state;

        return (
            <Fragment>
                <BillAddItem
                    onChangeItem={(item) => this.addItem(item)}
                    onChangeCatalog={(catalog) => this.addCatalog(catalog)}
                    saving={saving}
                />

                <BillCatalog
                    catalogs={catalogs}
                    onChangeCatalogs={(catalogs) => this.setState({catalogs})}
                    onAddItem={(item) => this.addItem(item)}
                />
            </Fragment>
        );
    }
}