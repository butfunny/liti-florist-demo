import React, {Fragment} from "react";
import {BillAddItem} from "./add/bill-add-item";
import {BillCatalog} from "./catalog/bill-catalog";
import {confirmModal} from "../../../components/confirm-modal/confirm-modal";
import {productApi} from "../../../api/product-api";
import {permissionInfo, premisesInfo} from "../../../security/premises-info";
import {RComponent} from "../../../components/r-component/r-component";
import {BillAddType} from "./type/bill-add-type";
import {BillAddColor} from "./type/bill-add-color";
import {userInfo} from "../../../security/user-info";
export class LeftSide extends RComponent {

    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            catalogs: [],
            types: [],
            colors: []
        };

        productApi.getTypes().then((types) => {
            this.setState({types: types})
        });

        productApi.getColors().then((colors) => {
            this.setState({colors: colors})
        });

        productApi.get().then((catalogs) => {
            this.setState({catalogs})
        });

        let listener = () => {
            this.setState({catalogs: []});
            productApi.get().then((catalogs) => {
                this.setState({catalogs})
            });
        };

        premisesInfo.onChange(listener);

        this.onUnmount(() => premisesInfo.removeListener(listener))
    }

    addItem({name, price, type, flowerType, color, size}) {
        let {items, onChangeItems} = this.props;
        let found = items.find(item => item.name == name);
        if (found) {
            onChangeItems(items.map(item => {
                if (item.name == name) {
                    return {...item, quantity: item.quantity + 1}
                }

                return item;
            }))
        } else {
            onChangeItems(items.concat({
                name, price, quantity: 1, vat: 0, flowerType: type ? type : flowerType, color, size
            }))
        }

    }

    addCatalog({name, price, type, color, size}) {
        let {catalogs} = this.state;
        let found = catalogs.find(c => c.name == name);

        if (found) {
            confirmModal.alert("Sản phẩm đã được thêm rồi");
        } else {
            this.setState({saving: true});
            productApi.create({name, price, flowerType: type, color, size}).then((catalog) => {
                this.setState({saving: false});
                this.setState({catalogs: catalogs.concat(catalog)})
            });
        }
    }

    render() {

        let {saving, catalogs, types, colors} = this.state;

        const permission = permissionInfo.getPermission();
        const user = userInfo.getUser();



        return (
            <Fragment>
                <BillAddItem
                    onChangeItem={(item) => this.addItem(item)}
                    onChangeCatalog={(catalog) => this.addCatalog(catalog)}
                    saving={saving}
                    types={types.map(t => t.name)}
                    colors={colors.map(t => t.name)}
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