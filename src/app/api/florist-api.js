import {api} from "./api";

export const floristApi = {
    getBills: (data) => {
        return api.post(`/api/florist/bills`, data)
    }
};