import {userInfo} from "./user-info";
import {securityApi} from "../api/security-api";
import {cache} from "../common/cache";
import {shopApi} from "../api/shop-api";
import {premisesAllInfo, premisesInfo} from "./premises-info";
export let security = {
    login: (data) => {
        return new Promise((resolve, reject)=>{
            securityApi.login(data).then((resp) => {
                cache.set(resp.token, "token");
                const user = resp.user;
                userInfo.setUser(user);
                resolve();

                // premisesApi.get().then(content => {
                //     premisesAllInfo.updatePremises(content);
                //     if (user.isAdmin) premisesInfo.updatePremises(content);
                //     else premisesInfo.updatePremises(content.filter(c => (user.premises|| []).indexOf(c._id) > -1));
                //     userInfo.setUser(user);
                //     resolve();
                // });
            }, (err) => {
                reject(err);
            })
        })
    },
    init: () => {
        return new Promise((resolve, reject)=>{
            securityApi.me().then((user) => {
                userInfo.setUser(user);
                resolve();
                // premisesApi.get().then(content => {
                //     premisesAllInfo.updatePremises(content);
                //     if (user.isAdmin) premisesInfo.updatePremises(content);
                //     else premisesInfo.updatePremises(content.filter(c => (user.premises|| []).indexOf(c._id) > -1));
                //     resolve();
                // });

            }, () => {
                localStorage.removeItem("token");
                resolve();
            })
        })

    },
    logout: () => {
        userInfo.setUser(null);
        localStorage.removeItem("token");
    }
};