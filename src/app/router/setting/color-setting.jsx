import React from "react";
import {SelectColor} from "../../components/select-color/select-color";
import {DataTable} from "../../components/data-table/data-table";
import {productApi} from "../../api/product-api";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
export class ColorSetting extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: undefined,
            colors: [],
            adding: false
        };

        productApi.getColors().then((colors) => {
            this.setState({colors: colors})
        });
    }

    addColor() {
        let {colors, color} = this.state;
        this.setState({adding: true});
        productApi.createColor({name: this.state.color}).then(() => {
            this.setState({adding: false});
            this.setState({colors: colors.concat({name: color}), color: undefined})
        });
    }

    removeColor(row) {
        confirmModal.show({
            title: "Xóa màu này?",
            description: "Bạn có đồng ý muốn xóa màu này không?"
        }).then(() => {
            productApi.removeColor(row.name);
            let {colors} = this.state;
            this.setState({colors: colors.filter(c => c.name != row.name)});
        })
    }

    render() {

        let columns = [{
            label: "Màu",
            width: "95%",
            display: (row) => <div className="color-display" style={{background: row.name}}/>,
            minWidth: "150"
        }, {
            label: "",
            width: "5%",
            display: (row) => <div className="text-right"><button className="btn btn-danger btn-small" onClick={() => this.removeColor(row)}><i className="fa fa-trash"/></button></div>,
            className: "number content-menu-action",
            minWidth: "60"
        }];

        let {color, colors, adding} = this.state;

        return (
            <div className="card">
                <div className="card-title">
                    Màu
                </div>

                <div className="card-body select-color-action">
                    <SelectColor
                        className="first-margin"
                        label="Chọn Màu"
                        value={color}
                        onChange={(color) => this.setState({color})}
                        error={colors.map(c => c.name).indexOf(color) > -1 ? "Trùng màu" : false}
                    />

                    <button className="btn btn-primary"
                            disabled={!color || colors.map(c => c.name).indexOf(color) > -1}
                            onClick={() => this.addColor()}>
                        <span className="btn-text">
                            Thêm
                        </span>

                        { adding && (
                            <span className="loading-icon">
                                 <i className="fa fa-spinner fa-pulse"/>
                            </span>
                        )}
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    rows={colors}
                />
            </div>
        );
    }
}