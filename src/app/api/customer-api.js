import {api} from "./api";

export const customerApi = {
    getCustomers: (data) => {
        return api.post("/api/customers", data);
    },
    getCustomer: (id) => {
        return api.get(`/api/customer/${id}`)
    },
    getCustomerByPhone: (phone) => {
        return api.get(`/api/find-customers-by-phone/${phone}`)
    },
    createCustomer: (customer) => {
        return api.post(`/api/customer`, customer)
    },
    updateCustomer: (id, customer) => {
        return api.put(`/api/customer/${id}`, customer)
    },
    getCustomerBirthDate: () => {
        return api.get(`/api/customers-birthday`);
    },
    getCustomersAll: () => {
        return api.get("/api/get-customers")
    },
    updateCustomerPay: (customerID) => {
        return api.put(`/api/update-customer-pay/${customerID}`)
    }
};