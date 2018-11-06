import React from "react";
import {Modal} from "./modal";
import {TransitionGroup, CSSTransition} from "react-transition-group";
import remove from "lodash/remove";

export class ModalsRegistry extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modalList: []
        };


        modals.openModal = (options) => {
            let modalOptions = {
                options,
                resolve: null
            };

            this.state.modalList.push(modalOptions);
            this.forceUpdate();
            let result = new Promise((resolve)=> {
                modalOptions.resolve = resolve;
            });
            return {
                dismiss: ()=> {
                    this.dismiss(modalOptions);
                },
                close: (result) => {
                    this.close(modalOptions, result);
                },
                result: result
            };
        };
    }

    dismiss(modal) {
        modal.resolve();
        remove(this.state.modalList, m => m == modal);
        this.forceUpdate();
    }

    close(modal, result) {
        modal.resolve(result);
        remove(this.state.modalList, m => m == modal);
        this.forceUpdate();
    }

    render() {
        const {modalList} = this.state;

        const Fade = ({ children, ...props }) => (
            <CSSTransition
                {...props}
                timeout={300}
                classNames="app-modal-fade"
            >
                {children}
            </CSSTransition>
        );

        return (
            <TransitionGroup className="app-modal-list">
                { modalList.map((modal, i)=> (
                    <Fade key={i}>
                        <Modal
                            cantKickOut={modal.options.cantKickOut}
                            isStack={modalList.length > 1}
                            className={modal.options.className}
                            content={modal.options.content}
                            onDismiss={() => this.dismiss(modal)}
                        />
                    </Fade>

                )) }
            </TransitionGroup>
        );
    }
}

export const modals = {};