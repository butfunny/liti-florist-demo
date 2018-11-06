import React from "react";
import {formValidator} from "./form-validator";
export class Form extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showError: false
        }
    }

    render() {

        let {validations, formValue, render, onSubmit, className} = this.props;
        let {showError} = this.state;

        let invalidPaths = formValidator.getInvalidPaths(formValue, validations);

        let getInvalidByKey = (key) => {
            let path = invalidPaths.find(path => path.invalidKey == key);
            if (showError && path) {
                return path.text;
            }

            return false;
        };


        return (
            <form
                className={className}
                onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({showError: true});
                invalidPaths.length == 0 && onSubmit && onSubmit();
            }}>
                {render(getInvalidByKey, invalidPaths)}
            </form>
        );
    }
}