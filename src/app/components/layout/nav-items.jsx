import {cache} from "../../common/cache";
import {premisesInfo} from "../../security/premises-info";
import {security} from "../../security/secuiry-fe";
import {modals} from "../modal/modals";
import {ChangePasswordModal} from "./change-password-modal";
import React from "react";
import {confirmModal} from "../confirm-modal/confirm-modal";
import {ConfigModal} from "./config-modal";

export const navItems = (premises, user) => {

    const _premises = premises.map(p => ({
        label: `Sang ${p.name}`,
        click: () => {
            cache.set(p._id, "active-premises");
            premisesInfo.forceUpdate();
        }
    }));

    return [{
        label: "Hoá Đơn",
        to: "/"
    }, {
        label: "Đơn Hàng",
        to: "/orders"
    }, {
        label: "Khách Hàng",
        child: [{
            label: "VIP",
            to: "/vip"
        }],
        hide: () => false
    }, {
        label: "Khuyến Mại",
        to: "/customers",
        hide: () => false
    }, {
        label: "Kho",
        child: [{
            label: "Will Code",
            hide: () => false
        }],
    }, {
        label: "Cơ Sở",
        child: [{
            label: "Quản Lý Cơ Sở",
            to: "/manage-premises",
            hide: () => false
        }, ..._premises],
    }, {
        label: "Tài Khoản",
        child: [{
            label: "Đổi Mật Khẩu",
            click: () => {
                const modal = modals.openModal({
                    content: (
                        <ChangePasswordModal
                            onClose={() => modal.close()}
                            onDone={() => {
                                modal.close();
                                confirmModal.alert("Đổi mật khẩu thành công");
                            }}
                        />
                    )
                })
            }
        }, {
            label: "Quản Lý Nhân Viên",
            to: "/manage-user",
            hide: () => false
        }, {
            label: "Thoát",
            click: () => {
                security.logout();
            }

        }]
    }]
};