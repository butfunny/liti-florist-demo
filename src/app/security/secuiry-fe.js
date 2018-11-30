import {userInfo} from "./user-info";
import {securityApi} from "../api/security-api";
import {cache} from "../common/cache";
import {shopApi} from "../api/shop-api";
import {permissionInfo, premisesAllInfo, premisesInfo} from "./premises-info";
import {permissions} from "../common/constance";

const initPermission = {
    "admin": permissions.map(p => p.value),
    "mkt": [],
    "tch": [],
    "dvkh": [],
    "bpmh": [],
    "sale": [],
    "salemanager": [],
    "florist": [],
    "ship": [],
    "ns": [],
    "ktt": [],
    "kt": [],
    "nl": [],
    "khotong": [],
};


export let security = {
    login: (data) => {
        return new Promise((resolve, reject)=>{
            securityApi.login(data).then((resp) => {
                cache.set(resp.token, "token");
                const user = resp.user;

                shopApi.get().then(shops => {
                    premisesAllInfo.updatePremises(shops);
                    premisesInfo.updatePremises(shops);
                    userInfo.setUser(user);

                    securityApi.getPermission().then((permission) => {
                        if (!permission) {
                            securityApi.upsertPermission(initPermission);
                            permissionInfo.updatePermission(initPermission);
                        } else {
                            permissionInfo.updateNormal(permission)
                        }

                        resolve();

                    });

                });
            }, (err) => {
                reject(err);
            })
        })
    },
    init: () => {
        return new Promise((resolve, reject)=>{
            securityApi.me().then((user) => {
                userInfo.setUser(user);
                shopApi.get().then(content => {
                    premisesAllInfo.updatePremises(content);
                    premisesInfo.updatePremises(content);

                    securityApi.getPermission().then((permission) => {
                        if (!permission) {
                            permissionInfo.updatePermission(initPermission);
                        } else {
                            permissionInfo.updateNormal(permission)
                        }

                        resolve();

                    });
                });

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