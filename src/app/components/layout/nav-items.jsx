import {cache} from "../../common/cache";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
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

    const permission = permissionInfo.getPermission();

    return [{
        label: "Hoá Đơn",
        to: "/",
        hide: () => permission[user.role].indexOf("bill.create") == -1
    }, {
        label: "Đơn Hàng",
        child: [{
            label: "Đơn Chính",
            to: "/orders",
            hide: () => permission[user.role].indexOf("bill.view") == -1
        }, {
            label: "Đơn Sẵn",
            to: "/draft",
            hide: () => permission[user.role].indexOf("bill.view") == -1
        }, {
            label: "Đơn Hàng Của Tôi",
            to: "/florist",
            hide: () => user.role != "florist"
        }, {
            label: "Đơn Hàng Của Tôi",
            to: "/ship",
            hide: () => user.role != "ship"
        }, {
            label: "Doanh Thu Của Tôi",
            to: "/salary",
            hide: () => user.role != "ship" && user.role != "florist" && user.role != "sale"
        }],
        hide: () => user.role != "ship" && user.role != "florist" && user.role != "sale" && !permission[user.role].find(r => r.indexOf("bill") > -1)
    }, {
        label: "Báo Cáo",
        child: [{
            label: "Doanh Thu",
            to: "/report-revenue",
            hide: () => permission[user.role].indexOf("report.report-revenue") == -1
        }, {
            label: "Đơn Hàng",
            to: "/report-bill",
            hide: () => permission[user.role].indexOf("report.report-bill") == -1
        }, {
            label: "Khách Hàng",
            to: "/report-customer",
            hide: () => permission[user.role].indexOf("report.report-customer") == -1
        }, {
            label: "Khuyến Mại",
            to: "/report-discount",
            hide: () => permission[user.role].indexOf("report.report-promotion") == -1
        }, {
            label: "Kho Ảnh",
            to: "/gallery",
            hide: () => permission[user.role].indexOf("report.gallery") == -1
        }],
        hide: () => !permission[user.role].find(r => r.indexOf("report") > -1)
    }, {
        label: "Khách Hàng",
        child: [{
            label: "Danh sách Khách Hàng",
            to: "/customers",
            hide: () => permission[user.role].indexOf("customer.list") == -1
        }, {
            label: "VIP",
            to: "/vip",
            hide: () => permission[user.role].indexOf("customer.vip.view") == -1
        }],
        hide: () => !permission[user.role].find(r => r.indexOf("customer") > -1)
    }, {
        label: "Khuyến Mại",
        to: "/promotion",
        hide: () => !permission[user.role].find(r => r.indexOf("promotion") == 0)
    }, {
        label: "Kho",
        child: [{
            to: "/warehouse",
            label: "Quản lí kho",
            hide: () => (permission[user.role].indexOf("warehouse.view") == -1 && permission[user.role].indexOf("warehouse.create") == -1) && permission[user.role].indexOf("warehouse.edit") == -1 && permission[user.role].indexOf("warehouse.edit") == -1
        }, {
            to: "/list-request-item",
            label: "Phiếu xuất nhập kho",
            hide: () => permission[user.role].indexOf("warehouse.request.view") == -1
        }, {
            to: "/request-item",
            label: "Phiếu yêu cầu xuất nhập kho",
            hide: () => permission[user.role].indexOf("warehouse.request.create") == -1
        }],
        hide: () => !permission[user.role].find(r => r.indexOf("warehouse") > -1)
    }, {
        label: "Cơ Sở",
        child: [{
            label: "Quản Lý Cơ Sở",
            to: "/manage-premises",
            hide: () => user.role != "admin"
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
            hide: () => user.role != "admin"
        },{
            label: "Phân Quyền",
            to: "/manage-role",
            hide: () => user.role != "admin"
        }, {
            label: "Thoát",
            click: () => {
                security.logout();
            }

        }]
    }]
};