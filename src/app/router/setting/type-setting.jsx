import React from "react";
import {DataTable} from "../../components/data-table/data-table";
import {Input} from "../../components/input/input";
import {confirmModal} from "../../components/confirm-modal/confirm-modal";
import {productApi} from "../../api/product-api";
export class TypeSetting extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: "",
            types: []
        }

        productApi.getTypes().then((types) => this.setState({types}))
    }

    addType() {
        let {types, type} = this.state;
        this.setState({adding: true});
        productApi.createType({name: this.state.type}).then(() => {
            this.setState({adding: false});
            this.setState({types: types.concat({name: type}), type: ""})
        });
    }

    removeType(row) {
        confirmModal.show({
            title: "Xóa loại này?",
            description: "Bạn có đồng ý muốn xóa loại này không?"
        }).then(() => {
            productApi.removeType(row.name);
            let {types} = this.state;
            this.setState({types: types.filter(c => c.name != row.name)});
        })
    }


    render() {

        let columns = [{
            label: "Loại",
            width: "95%",
            display: (row) => <div className="type-name">{row.name}</div>,
            minWidth: "150"
        }, {
            label: "",
            width: "5%",
            display: (row) => <div className="text-right"><button className="btn btn-danger btn-small" onClick={() => this.removeType(row)}><i className="fa fa-trash"/></button></div>,
            className: "number content-menu-action",
            minWidth: "60"
        }];

        let {type, types, adding} = this.state;
        return (
            <div className="card">
                <div className="card-title">
                    Loại
                </div>

                <div className="card-body select-color-action">
                    <Input
                        className="first-margin"
                        onKeyDown={(e) => e.key == "Enter" && type.length > 0 && types.map(c => c.name).indexOf(type) == -1 && this.addType()}
                        label="Tên Loại"
                        value={type}
                        onChange={(e) => this.setState({type: e.target.value})}
                        error={types.map(c => c.name).indexOf(type) > -1 ? "Trùng loại" : false}
                    />

                    <button className="btn btn-primary"
                            disabled={type.length == 0 || types.map(c => c.name).indexOf(type) > -1}
                            onClick={() =>  this.addType()}>
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
                    rows={types}
                />
            </div>
        );
    }
}