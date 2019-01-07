const keys = require("lodash/keys");

export let formValidator = {
    getInvalidPaths: (formValue, validations) => {
        let invalidPaths = [];
        for (let item of validations) {
            let path = keys(item)[0];
            let pathData = formValue[path];
            let arrFunc = item[path];

            if (path.indexOf("@") > -1) {
                let arr = path.substring(1).split(".");
                let formValueElem = formValue[arr[0]][arr[1]];

                for (let func of arrFunc) {
                    if (!func(formValueElem).valid) {
                        invalidPaths.push({
                            invalidKey: path,
                            text: func(formValueElem).text
                        })
                    }
                }
            } else {
                for (let func of arrFunc) {
                    if (!func(pathData).valid) {
                        invalidPaths.push({
                            invalidKey: path,
                            text: func(pathData).text
                        });
                        break;
                    }
                }
            }


        }
        return invalidPaths;
    }
};