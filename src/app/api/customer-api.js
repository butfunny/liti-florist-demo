import {api} from "./api";

export const customerApi = {
    getCustomers: () => {
        return api.get("/api/customers");
    },
    getCustomer: (id) => {
        return api.get(`/api/customer/${id}`)
    },
    getCustomerByPhone: (phone) => {
        return api.get(`/api/customer-by-phone/${phone}`)
    },
    createCustomer: (customer) => {
        return api.post(`/api/customer`, customer)
    },
    updateCustomer: (id, customer) => {
        return api.put(`/api/customer/${id}`, customer)
    }
};