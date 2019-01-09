import React from "react";
import {formatNumber} from "../../../../common/common";
import {confirmModal} from "../../../../components/confirm-modal/confirm-modal";
import {productApi} from "../../../../api/product-api";
import {modals} from "../../../../components/modal/modals";
import {EditCatalogModal} from "./edit-catalog-modal";
export class BillCatalog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyword: ""
        }
    }

    editCatalog(catalog) {

        let {catalogs, onChangeCatalogs} = this.props;

        const handleClose = (catalog) => {
            onChangeCatalogs(catalogs.map(c => {
                if (c._id == catalog._id) return catalog;
                return c;
            }))
        };

        const modal = modals.openModal({
            content: (
                <EditCatalogModal
                    catalog={catalog}
                    onDismiss={() => modal.close()}
                    onClose={(catalog) => {modal.close(); handleClose(catalog)}}
                />
            )
        })
    }

    removeCatalog(catalog) {

        let {onChangeCatalogs, catalogs} = this.props;

        confirmModal.show({title: `Xoá ${catalog.name}?`, description: "Bạn có chắc chắn muốn xoá sản phẩm này?"}).then(() => {
            productApi.delete(catalog._id);
            onChangeCatalogs(catalogs.filter(c => c._id != catalog._id));
        })
    }

    render() {

        let {catalogs, onAddItem} = this.props;
        let {keyword} = this.state;

        const filteredCatalogs = catalogs.filter(c => c.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1);

        return (
            <div className="bill-catalog card">
                <div className="card-title">
                    Danh mục sản phẩm
                </div>

                { filteredCatalogs.map((catalog, index) => (
                    <div className="product" key={index} onClick={() => onAddItem(catalog)}>
                        <div className="product-item">
                            {catalog.type} {catalog.name}
                            <span className="badge">{formatNumber(catalog.price)}</span>
                        </div>
                        <div className="product-edit">
                            <button className="btn btn-danger btn-small" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.removeCatalog(catalog)
                            }}>
                                <i className="fa fa-trash"/>
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        );
    }
}