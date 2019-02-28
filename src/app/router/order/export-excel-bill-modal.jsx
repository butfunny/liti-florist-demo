import React from "react";
import {DataTable} from "../../components/data-table/data-table";
import sortBy from "lodash/sortBy";
import {premisesInfo} from "../../security/premises-info";
import {Checkbox} from "../../components/checkbox/checkbox";
import {DatePicker} from "../../components/date-picker/date-picker";
import {billApi} from "../../api/bill-api";
import {getCSVData} from "./excel";
import {CSVLink} from "react-csv";
export class ExportExcelBillModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            from: props.from,
            to: props.to,
            selectedPremises: [],
            bills: null
        }
    }

    getBills() {
        this.setState({loading: true});
        let {from, to, selectedPremises} = this.state;
        billApi.exportExcelBill({
            from, to, selectedPremises
        }).then(({bills, customers}) => {
            this.setState({
                bills: bills.map(b => ({
                    ...b,
                    customer: customers.find(c => c._id == b.customerId)
                })),
                loading: false
            })
        })
    }

    render() {

        let {from, to, selectedPremises, loading, bills} = this.state;
        let {onDismiss} = this.props;

        const premises = premisesInfo.getPremises();


        return (
            <div className="app-modal-box bill-report-route">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Xuất Excel</h5>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">

                        <div className="row first-margin"
                        >
                            <DatePicker
                                className="col"
                                label="Từ Ngày"
                                value={from}
                                onChange={(from) => {
                                    this.setState({from})
                                }}
                            />

                            <DatePicker
                                className="col"
                                label="Tới Ngày"
                                value={to}
                                onChange={(to) => {
                                    this.setState({to})
                                }}
                            />

                            <button className="btn btn-primary"
                                    onClick={() => this.getBills()}
                                    disabled={loading || selectedPremises.length == 0}
                            >
                                <span className="btn-text">Tìm</span>
                                {loading &&
                                <span className="loading-icon"><i className="fa fa-spinner fa-pulse"/></span>}
                            </button>
                        </div>


                        <div style={{marginBottom: "10px"}}><b>Cơ sở: </b></div>

                        { premises.map((p, index) => (
                            <Checkbox
                                key={index}
                                value={selectedPremises.indexOf(p._id) > -1}
                                onChange={(checked) => {
                                    if (checked) this.setState({selectedPremises: selectedPremises.concat(p._id)});
                                    else this.setState({selectedPremises: selectedPremises.filter(s => s != p._id)});
                                }}
                                label={p.name}
                            />
                        ))}

                        <div style={{
                            marginTop: "10px"
                        }}>
                            { !loading && bills && (
                                <CSVLink
                                    data={getCSVData(bills)}
                                    filename={"baocao.csv"}
                                    className="btn btn-primary btn-small">
                                    <span className="btn-text">Tải xuống</span>
                                    <span className="loading-icon"><i className="fa fa-file-excel-o"/></span>
                                </CSVLink>
                            )}
                        </div>
                    </div>




                    <div className="modal-footer">
                        <button type="button" className="btn btn-link " data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    </div>
                </div>
            </div>
        );
    }
}