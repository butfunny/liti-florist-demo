import {api} from "./api";

export const warehouseApi = {
    createItem: (item) => {
        return api.post(`/api/warehouse/create`, item)
    },
    createItemViaUpload: (items) => {
        return api.post(`/api/warehouse-upload/create`, items)
    },
    getItems: () => {
        return api.get(`/api/warehouse/list/`)
    },
    updateItems: (id, item) => {
        return api.put(`/api/warehouse/${id}`, item)
    },
    removeItems: (id) => {
        return api.post(`/api/warehouse/${id}`)
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