import {api} from "./api";

export const securityApi = {
    login: (data) => {
        return api.post("/api/login", data);
    },
    me: () => {
        return api.get("/api/me");
    },
    changePassword: (data) => {
        return api.post("/api/me/change-password", data);
    },
    getUsers: () => {
        return api.get("/api/manage/users");
    },
    createUser: (user) => {
        return api.post("/api/manage/user", user)
    },
    updateUser: (id, updatedUser) => {
        return api.put(`/api/manage/user/${id}`, updatedUser)
    },
    removeUser: (id) => {
        return api.delete(`/api/manage/user/${id}`)
    },
    getSalesAndFlorist: () => {
        return api.get("/api//get-sales-florist-account")
    },
    upsertPermission: (permission) => {
        return api.post(`/api/permission`, permission)
    },
    getPermission: () => {
        return api.get(`/api/permission`)
    }
};