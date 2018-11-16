import {api} from "./api";

export const shipApi = {
    getBills: (data) => {
        return api.post(`/api/ship/bills`, data);
    },
    submitBill: (data) => {
        return api.post(`/api/ship/done-bill`, data);
    }
};