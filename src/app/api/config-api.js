import {api} from "./api";

export const configApi = {
    get: () => {
        return api.get("/api/config");
    },
    update: (data) => {
        return api.put(`/api/config`, data);
    }
};