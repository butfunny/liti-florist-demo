export const required = (path) => (val) => ({
    text: `${path} không được để trống`,
    valid: Number.isInteger(parseInt(val)) ? true : val && val.length > 0
});

export const minLength = (length, path) => (val) => ({
    text: `${path} phải có ít nhất ${length} kí tự`,
    valid: val ? val.length >= length : true
});


export let isSame = (anotherVal, path) => (val) => ({
    text: `${path} không trùng`,
    valid: val == anotherVal
});

export const isNumber = (path) => (val) => {
    return {
        text: `${path} phải là số`,
        valid: !isNaN(val)
    }
};

export const minVal = (path, minVal) => (val) => {
    return {
        text: `${path} phải lớn hơn hoặc bằng ${minVal}`,
        valid: val != "" && val >= minVal
    }
};

export const maxVal = (path, maxVal) => (val) => {
    return {
        text: `${path} phải nhỏ hơn hoặc bằng ${maxVal}`,
        valid: val <= maxVal
    }
};


