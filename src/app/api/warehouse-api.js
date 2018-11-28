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
    },
    rejectRequest: (id, data) => {
        return api.post(`/api/reject-request/${id}`, data);
    },
    acceptRequest: (id, data) => {
        return api.post(`/api/accept-request/${id}`, data)
    },
    acceptReturn: (id) => {
        return api.post(`/api/accept-return/${id}`)
    }

};