import {api} from "./api";

export const photosApi = {
    getPhotos: () => {
        return api.get(`/api/photos`);
    },
    updatePhoto: (id, data) => {
        return api.put(`/api/photos/${id}`, data);
    },
    createPhoto: (data) => {
        return api.post(`/api/photos`, data)
    },
    removePhoto: (id) => {
        return api.delete(`/api/photos/${id}`)
    }
};