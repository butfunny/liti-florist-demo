import {api} from "./api";

export const promotionApi = {
    get: () => {
        return api.get(`/api/promotion`);
    },
    update: (id, data) => {
        return api.put(`/api/promotion/${id}`, data);
    },
    create: (data) => {
        return api.post("/api/promotion", data);
    },
    delete: (id) => {
        return api.delete(`/api/promotion/${id}`);
    }
};