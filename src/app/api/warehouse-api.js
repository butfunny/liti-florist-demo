import {api} from "./api";

export const warehouseApi = {
    createItem: (items) => {
        return api.post(`/api/warehouse/create`, items)
    },
    getItems: () => {
        return api.get(`/api/warehouse/list/`)
    },
    updateItems: (items) => {
        return api.put(`/api/warehouse/update/`, items)
    },
    removeItems: (items) => {
        return api.post(`/api/warehouse/remove-multiple`, items)
    },
    getItemsById: (baseID) => {
        return api.get(`/api/warehouse/list-by-id/${baseID}`);
    },
    createRequest: (items) => {
        return api.post(`/api/request-warehouse/create`, items)
    },
    getRequests: () => {
        return api.get(`/api/request-warehouse/list`);
    }

};