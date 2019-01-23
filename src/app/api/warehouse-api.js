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
    },
    getReportSupplier: (data) => {
        return api.post(`/api/warehouse/report-supplier`, data);
    },
    getReportAllItems: () => {
        return api.post(`/api/warehouse/report-all-items`)
    },
    updateWarehousePrice: (id, data) => {
        return api.put(`/api/warehouse/update-price/${id}`, data)
    }

};