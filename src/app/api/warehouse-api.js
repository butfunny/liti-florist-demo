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
    }
};