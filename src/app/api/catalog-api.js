import {api} from "./api";

export const catalogApi = {
    get: () => {
        return api.get("/api/catalog");
    },
    update: (id, data) => {
        return api.put(`/api/catalog/${id}`, data);
    },
    create: (data) => {
        return api.post("/api/catalog", data);
    },
    delete: (id) => {
        return api.delete(`/api/catalog/${id}`);
    }
};