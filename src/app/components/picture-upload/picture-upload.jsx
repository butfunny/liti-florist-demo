import React from "react";
import classnames from "classnames";
import {resizeImage} from "../../common/common";
import {uploadApi} from "../../api/upload-api";
import {billApi} from "../../api/bill-api";
export class PictureUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploading: false
        }
    }

    handleChange(e) {
        if (e.target.files[0]) {
            resizeImage(e.target.files[0]).then((file) => {
                this.setState({uploading: true});
                uploadApi.upload(file).then(resp => {
                    this.setState({uploading: false});
                    this.props.onChange(resp.file);
                })
            })
        }
    }


    render() {

        let {label, value, onChange, error} = this.props;
        let {uploading} = this.state;

        return (
            <div className={classnames("picture-upload", error && "has-error")}

            >
                <div className="label">
                    {label}
                </div>

                <input className="input-upload"
                       ref={elem => this.inputUpload = elem}
                       type="file"
                       accept="image/png, image/jpeg"
                       onChange={(e) => this.handleChange(e)}
                />



                <div className="image-wrapper"
                     style={{
                         backgroundImage: value ? `url(${value})`: null,
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                         backgroundSize: "cover"
                     }}
                >
                    <button className="btn btn-small btn-primary" type="button"
                            onClick={() => this.inputUpload.click()}
                    >
                        { uploading ? <i className="fa fa-spinner fa-pulse" aria-hidden="true"/> : <i className="fa fa-camera" aria-hidden="true"/>}
                    </button>
                </div>

                <div className="error">
                    {error}
                </div>

            </div>
        );
    }
}