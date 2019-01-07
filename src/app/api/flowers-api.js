import {api} from "./api";

export const flowersApi = {
    createFlower: (flower) => {
        return api.post("/api/flowers", flower)
    },
    updateFlower: (id, flower) => {
        return api.put("/api/flower/" + id, flower)
    },
    removeFlower: (id) => {
        return api.delete("/api/flower/" + id);
    }
};