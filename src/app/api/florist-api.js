import {api} from "./api";

export const floristApi = {
    getBills: (data) => {
        return api.post(`/api/florist/bills`, data);
    },
    submitBill: (data) => {
        return api.post(`/api/florist/submit-bill`, data);
    },
    getMySalary: (data) => {
        return api.post(`/api/salary`, data)
    }
};