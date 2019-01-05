import React from "react";
import {Layout} from "../../components/layout/layout";
import {DataTable} from "../../components/data-table/data-table";

export class SettingRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let columns = [{
            label: "Màu",
            width: "80%",
            sortBy: (row) => row.color,
            display: (row) => row.color,
            minWidth: "150"
        }, {
            label: "",
            width: "20%",
            onClickCol: (e) => {
                e.preventDefault();
                e.stopPropagation();
            },
            display: (row) => (
                <div>
                    delêt
                </div>
            ),
            className: "number content-menu-action",
            minWidth: "60"
        }];


        return (
            <Layout
                activeRoute="Cài Đặt Màu, Loại"
            >
                <div className="setting-route">
                    <div className="card">
                        <div className="card-title">
                            Màu
                        </div>

                        <div className="card-body">
                            Add
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