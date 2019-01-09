import {api} from "./api";

export const warehouseApi = {
    createRequest: (request) => {
        return api.post("/api/warehouse/create-request", request)
    },
    updateRequest: (id, request) => {
        return api.put("/api/warehouse/update-request/" + id, request)
    },
    getRequest: (data) => {
        return api.post("/api/warehouse/request-list", data)
    },
    acceptRequest: (id) => {
        return api.post("/api/warehouse/accept-request/" + id)
    },
    getRequestByID: (id) => {
        return api.get("/api/warehouse/detail-request/" + id)
    },
    searchProductInBase: (keyword) => {
        return api.post("/api/warehouse/base-items", {keyword})
    },
    searchProductInSubWarehouse: (data) => {
        return api.post("/api/warehouse/sub-warehouse-items", data)
    }

    // createItem: (item) => {
    //     return api.post(`/api/warehouse/create`, item)
    // },
    // createItemViaUpload: (items) => {
    //     return api.post(`/api/warehouse-upload/create`, items)
    // },
    // getItems: () => {
    //     return api.get(`/api/warehouse/list/`)
    // },
    // updateItem: (id, item) => {
    //     return api.put(`/api/warehouse/${id}`, item)
    // },
    // removeItems: (id) => {
    //     return api.post(`/api/warehouse/${id}`)
    // },
    // getItemsById: (baseID) => {
    //     return api.get(`/api/warehouse/list-by-id/${baseID}`);
    // },
    // createRequest: (items) => {
    //     return api.post(`/api/request-warehouse/create`, items)
    // },
    // getRequests: () => {
    //     return api.get(`/api/request-warehouse/list`);
    // },
    // rejectRequest: (id, data) => {
    //     return api.post(`/api/reject-request/${id}`, data);
    // },
    // acceptRequest: (id, data) => {
    //     return api.post(`/api/accept-request/${id}`, data)
    // },
    // acceptReturn: (id) => {
    //     return api.post(`/api/accept-return/${id}`)
    // },
    // createRequestMissing: (request) => {
    //     return api.post(`/api/request-missing-item`, request)
    // },
    // getRequestMissing: (data) => {
    //     return api.post(`/api/request-missing-item-data`, data);
    // },
    // rejectRequestMissing: (id) => {
    //     return api.post("/api/reject-missing-item/" + id)
    // },
    // acceptRequestMissing: (id) => {
    //     return api.post("/api/accept-missing-item/" + id)
    // }

};