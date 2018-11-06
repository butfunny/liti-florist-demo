import {cache} from "../common/cache";

const xhrWithPayload = (method) => {
    return (url, payload) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                data: JSON.stringify(payload),
                method: method,
                contentType: "application/json",
                headers: {
                    authorization: `Bearer ${cache.get("token")}`
                },
                success: (data) => {
                    resolve(data);
                },
                error: (resp, status, error) => {
                    reject(resp.responseJSON || resp.status);
                }
            });
        });
    };
};
const xhrWithoutPayload = (method) => {
    return (url, options) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: method,
                contentType: "application/json",
                headers: {
                    authorization: `Bearer ${cache.get("token")}`
                },
                success: (data) => {
                    resolve(data)
                },
                error: (resp) => {
                    reject(resp.responseJSON || resp.status);
                }
            });
        });
    };
};

export const api = {
    get: xhrWithoutPayload("GET"),
    delete: xhrWithoutPayload("DELETE"),
    post: xhrWithPayload("POST"),
    put: xhrWithPayload("PUT")
};
