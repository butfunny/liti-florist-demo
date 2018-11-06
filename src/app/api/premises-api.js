import {api} from "./api";

export const premisesApi = {
    get: () => {
        return api.get("/api/premises");
    },
    update: (id, data) => {
        return api.put(`/api/premises/${id}`, data);
    },
    create: (data) => {
        return api.post("/api/premises", data);
    },
    delete: (id) => {
        return api.delete(`/api/premises/${id}`);
    }
};