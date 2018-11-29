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

    const subWarehouse = premises.map(p => ({
        label: `Kho ${p.name}`,
        to: `/sub-warehouse/${p._id}`
    }));

    return [{
        label: "Hoá Đơn",
        to: "/"
    }, {
        label: "Đơn Hàng",
        child: [{
            label: "Đơn Chính",
            to: "/orders"
        }, {
            label: "Đơn Sẵn",
            to: "/draft"
        }]
    }, {
        label: "Báo Cáo",
        child: [{
            label: "Doanh Thu",
            to: "/report-revenue"
        }, {
            label: "Đơn Hàng",
            to: "/report-bill"
        }, {
            label: "Khách Hàng",
            to: "/report-customer"
        }, {
            label: "Khuyến Mại",
            to: "/report-discount"
        }],
        hide: () => false
    }, {
        label: "Khách Hàng",
        child: [{
            label: "Danh sách Khách Hàng",
            to: "/customers"
        }, {
            label: "VIP",
            to: "/vip"
        }],
        hide: () => false
    }, {
        label: "Khuyến Mại",
        to: "/promotion",
        hide: () => false
    }, {
        label: "Kho",
        child: [{
            to: "/warehouse",
            label: "Quản lí kho"
        }, {
            to: "/list-request-item",
            label: "Phiếu xuất nhập kho"
        }, {
            to: "/request-item",
            label: "Phiếu yêu cầu xuất nhập kho"
        }]
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