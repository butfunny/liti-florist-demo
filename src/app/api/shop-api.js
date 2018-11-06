import {api} from "./api";

export const shopApi = {
    get: () => {
        return api.get("/api/shops");
    },
    update: (id, data) => {
        return api.put(`/api/shops/${id}`, data);
    },
    create: (data) => {
        return api.post("/api/shops", data);
    },
    delete: (id) => {
        return api.delete(`/api/shops/${id}`);
    }
};