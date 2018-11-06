let premises = null;
let listeners = [];

export const premisesInfo = {
    getPremises: () => premises,
    updatePremises: (content) => {
        premises = content;
        listeners.forEach(f => f());
    },
    onChange: (func) => listeners.push(func),
    forceUpdate: () => {
        listeners.forEach(f => f())
    }
};


let premisesAll = null;

export const premisesAllInfo = {
    getPremises: () => premisesAll,
    updatePremises: (content) => {
        premisesAll = content;
    }
};