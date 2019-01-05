import {cache} from "../common/cache";
import {securityApi} from "../api/security-api";

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
    },
    getActivePremise: () => {
        if (cache.get("active-premises")) {
            return premises.find(p => p._id == cache.get("active-premises"));
        } else {
            cache.get(premises[0]._id, "active-premises");
            return premises[0];
        }
    },
    removeListener: (listener) => {
        listeners.filter(l => l != listener);
    }
};


let premisesAll = null;

export const premisesAllInfo = {
    getPremises: () => premisesAll,
    updatePremises: (content) => {
        premisesAll = content;
    }
};

let permission = null;

export const permissionInfo = {
    getPermission: () => permission,
    updatePermission: (_permission) => {
        permission = _permission;
        securityApi.upsertPermission(permission);
    },
    updateNormal: (_permission) => {
        permission = _permission;
    }
};