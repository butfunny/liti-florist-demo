import React from "react";
import {modals} from "../modal/modals";
export class ConfirmModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {info, onClose, onDismiss} = this.props;

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h6 className="modal-title">{info.title}</h6>
                        <button type="button" className="close" onClick={() => onClose()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        {info.description}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={() => onClose()}>Xác Nhận</button>
                        <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    </div>

                </div>
            </div>
        );
    }
}

export class AlertModal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {text, onDismiss} = this.props;

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-body">
                        {text}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Đóng</button>
                    </div>

                </div>
            </div>
        );
    }
}


export const confirmModal =  {
    show: (info) => {
        return new Promise((resolve, reject)=>{
            const modal = modals.openModal({
                content: <ConfirmModal
                    info={info}
                    onClose={() => {modal.close(); resolve()}}
                    onDismiss={() => {modal.close()}}
                />
            })
        })
    },
    alert: (text) => {
        const modal = modals.openModal({
            content: <AlertModal
                text={text}
                onDismiss={() => {modal.close()}}
            />
        })
    }
};