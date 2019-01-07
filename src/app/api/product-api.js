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
    },
    getTypes: () => {
        return api.get("/api/product-type");
    },
    createType: (data) => {
        return api.post("/api/product-type", data)
    },
    getColors: () => {
        return api.get("/api/product-color");
    },
    createColor: (data) => {
        return api.post("/api/product-color", data)
    },
    removeType: (name) => {
        return api.put("/api/product-type", {name});
    },
    removeColor: (name) => {
        return api.put("/api/product-color", {name});
    },
    createSupplier: (data) => {
        return api.post("/api/supplier", data)
    },
    suppliers: () => {
        return api.get("/api/suppliers");
    },
    removeSupplier: (id) => {
        return api.delete("/api/supplier/" + id);
    },
    updateSupplier: (id, data) => {
        return api.put("/api/supplier/" + id, data)
    }
};