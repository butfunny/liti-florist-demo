import React from "react";
import {modals} from "../modal/modals";
import {Input} from "../input/input";
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
                        <button type="button" className="btn btn-link  ml-auto" data-dismiss="modal" onClick={() => onDismiss()}>Thôi</button>
                        <button type="button" className="btn btn-primary" onClick={() => onClose()}>Xác Nhận</button>
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
                        <button type="button" className="btn btn-primary " onClick={() => onDismiss()}>Đóng</button>
                    </div>

                </div>
            </div>
        );
    }
}

class InputAlertModal extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            text: ""
        }
    }

    render() {

        let {title, onDismiss, label, onClose} = this.props;
        let {text} = this.state;

        return (
            <div className="app-modal-box">
                <div className="modal-content">
                    <div className="modal-header">
                        <h6 className="modal-title">{title}</h6>
                        <button type="button" className="close" onClick={() => onDismiss()}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <Input
                            label={`${label}*`}
                            value={text}
                            onChange={(e) => this.setState({text: e.target.value})}
                            onKeyDown={(e) => e.key == "Enter" && text.length > 0 && onClose(text)}
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            disabled={text.length == 0}
                            type="button" className="btn btn-primary" onClick={() => onClose(text)}>Xác Nhận</button>
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
    },
    showInput: (props) => {
        return new Promise((resolve, reject)=>{
            const modal = modals.openModal({
                content: <InputAlertModal
                    {...props}
                    onClose={(text) => {modal.close(); resolve(text)}}
                    onDismiss={() => {modal.close()}}
                />
            })
        })

    }
};