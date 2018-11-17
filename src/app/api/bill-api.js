import {api} from "./api";

export const billApi = {
    createBill: (bill) => {
        return api.post(`/api/bill`, bill)
    },
    createBillDraft: (bill) => {
        return api.post(`/api/bill-draft`, bill)
    },
    getBills: (id, time) => {
        return api.post(`/api/bills/${id}`, time)
    },
    getAllBills: (time) => {
        return api.post(`/api/bills-all`, time)
    },
    updateBillStatus: (id, status) => {
        return api.put(`/api/bill-update-status/${id}`, status)
    },
    updateBill: (id, bill) => {
        return api.put(`/api/bill/${id}`, bill)
    },
    removeBill: (id) => {
        return api.delete(`/api/bill/${id}`)
    },
    getBillById: (id) => {
        return api.get(`/api/bill/${id}`)
    },
    updateBillImage: (billID, file) => {
        return api.put(`/api/bill/update-image/${billID}`, file)
    }
};