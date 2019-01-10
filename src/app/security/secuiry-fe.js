import {userInfo} from "./user-info";
import {securityApi} from "../api/security-api";
import {cache} from "../common/cache";
import {shopApi} from "../api/shop-api";
import {permissionInfo, premisesAllInfo, premisesInfo} from "./premises-info";
import {permissions} from "../common/constance";
import {navItems} from "../components/layout/nav-items";

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
    "guest": []
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

                    securityApi.getPermission().then((permission) => {
                        if (!permission) {
                            securityApi.upsertPermission(initPermission);
                            permissionInfo.updatePermission(initPermission);
                        } else {
                            permissionInfo.updateNormal(permission)
                        }
                        userInfo.setUser(user);
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
    },
    isHavePermission: (target) => {
        const permission = permissionInfo.getPermission();


        const user = userInfo.getUser();
        for (let per of target) {
            if (permission[user.role].indexOf(per) > -1) return true
        }

        return false;
    },
    getDefaultRoute: (user) => {
        const _navItems = navItems(user);
        let to = null;

        const route = _navItems.find(n => {
            if (n.child) {
                let found = n.child.find(item => !item.hide());
                if (found) {
                    to = found.to;
                    return true;
                }
            } else {
                if (!n.hide()) {
                    to = n.to;
                    return true
                }
            }


        });

        return to ? to : route.to
    }
};