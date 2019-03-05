import {api} from "./api";
import {premisesInfo} from "../security/premises-info";

export const billApi = {
    createBill: (bill) => {
        return api.post(`/api/bill`, bill)
    },
    createBillDraft: (bill) => {
        return api.post(`/api/bill-draft`, bill)
    },
    getBills: (id, time) => {
        return api.post(`/api/bills-report/${id}`, time)
    },
    getAllBills: (time) => {
        return api.post(`/api/bills-all`, time)
    },
    getBillNumbers: (time) => {
        return api.post(`/api/bill-number`, time)
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
    },
    getBillDraftList: () => {
        return api.get(`/api/bill-draft-list/${premisesInfo.getActivePremise()._id}`)
    },
    getBillDraftById: (id) => {
        return api.get(`/api/bill-draft/${id}`)
    },
    updateBillDraft: (id, data) => {
        return api.put(`/api/bill-draft/${id}`, data)
    },
    removeBillDraft: (id) => {
        return api.delete(`/api/bill-draft/${id}`)
    },
    getReportAll: (data) => {
        return api.post(`/api/bills-report-all`, data)
    },
    getBillImages: () => {
        return api.get("/api/bill-images")
    },
    moveBill: (id, data) => {
        return api.put("/api/bill-move-premises/" + id, data)
    },
    exportExcelBill: (data) => {
        return api.post(`/api/bills-report-excel`, data);
    }
};