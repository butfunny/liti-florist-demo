import React from "react";
import {Layout} from "../../components/layout/layout";
import {DataTable} from "../../components/data-table/data-table";
import {SelectColor} from "../../components/select-color/select-color";

export class SettingRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: undefined
        }
    }

    render() {

        let columns = [{
            label: "Màu",
            width: "80%",
            sortBy: (row) => row.color,
            display: (row) => <div className="color-display" style={{background: row.color}}/>,
            minWidth: "150"
        }, {
            label: "",
            width: "20%",
            onClickCol: (e) => {
                e.preventDefault();
                e.stopPropagation();
            },
            display: (row) => <button className="btn btn-danger"><i className="fa fa-trash"/></button>,
            className: "number content-menu-action",
            minWidth: "60"
        }];

        let {color} = this.state;

        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">
                    <div className="card">
                        <div className="card-title">
                            Màu
                        </div>

                        <div className="select-color-action">
                            <SelectColor
                                label="Chọn Màu"
                                value={color}
                                onChange={(color) => this.setState({color})}
                            />

                            <button className="btn btn-primary">
                                Thêm
                            </button>
                        </div>

                        <DataTable
                            columns={columns}
                            rows={[{color: "#efefef"}]}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}