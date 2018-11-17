import {api} from "./api";
import {cache} from "../common/cache";

export const uploadApi = {
    upload: (data) => {
        return new Promise((resolve, reject) => {
            let imageFormData = new FormData();
            imageFormData.append('imageFile', data);
            var xhr = new XMLHttpRequest();
            xhr.open('post', "/api/upload", true);
            xhr.setRequestHeader("authorization", `Bearer ${cache.get("token")}`);

            xhr.onload = function () {
                if (this.status == 200) {
                    resolve(JSON.parse(this.response));
                } else {
                    reject(this.statusText);
                }
            };

            xhr.send(imageFormData);

        });
    }
};