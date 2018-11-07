import {api} from "./api";
import {premisesInfo} from "../security/premises-info";

export const productApi = {
    get: () => {
        let premise = premisesInfo.getActivePremise();
        return api.get(`/api/products/${premise._id}`);
    },
    update: (id, data) => {
        return api.put(`/api/product/${id}`, data);
    },
    create: (data) => {
        let premise = premisesInfo.getActivePremise();
        return api.post("/api/product", {
            ...data,
            base_id: premise._id
        });
    },
    delete: (id) => {
        return api.delete(`/api/product/${id}`);
    }
};