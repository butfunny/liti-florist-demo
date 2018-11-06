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
                for (let i = 0; i < formValue[arr[0]].length; i++) {
                    let formValueElem = formValue[arr[0]][i][arr[1]];

                    for (let func of arrFunc) {
                        if (!func(formValueElem, formValue[arr[0]][i]).valid) {
                            invalidPaths.push({
                                invalidKey: path,
                                text: func(formValueElem).text,
                                index: i
                            })
                        }
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