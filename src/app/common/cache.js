const set = (value, key) => {
    if (value == null) {
        localStorage.removeItem(key);
    } else {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // May throw exception if not enough memory allocated or in Safari's private mode
        }
    }
};

export const cache = {
    set: set,
    get(key) {
        let vStr = localStorage.getItem(key);
        if (vStr == null) {
            return null;
        }
        return JSON.parse(vStr);
    }
};