import {api} from "./api";

export const vipApi = {
    createVip: (vip) => {
        return api.post(`/api/vip/create`, vip)
    },
    getVipByCustomerID: (cid) => {
        return api.get(`/api/vip/customer/${cid}`)
    },
    getVipByCardID: (cardID) => {
        return api.get(`/api/vip/card/${cardID}`)
    },
    getVipList: () => {
        return api.get(`/api/vip/list`)
    },
    removeVIP: (id) => {
        return api.delete(`/api/vip/${id}`)
    }
};