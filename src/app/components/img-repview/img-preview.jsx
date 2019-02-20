import React from "react";
import {modals} from "../modal/modals";
export class ImgPreview extends React.Component {

    constructor(props) {
        super(props);
    }

    preview() {
        const modal = modals.openModal({
            content: <ImagePreviewModal src={this.props.src} />
        })
    }

    render() {
        let {src, style} = this.props;
        console.log(style);


        return (
            <img className="img-preview" style={style} src={src} alt="" onClick={() => this.preview()}/>
        );
    }
}

class ImagePreviewModal extends React.Component {

    render() {

        let {src} = this.props;

        return (
            <img src={src}  className="image-preview-modal"/>
        )
    }
}