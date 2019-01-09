import {cache} from "../../common/cache";
import {permissionInfo, premisesInfo} from "../../security/premises-info";
import {security} from "../../security/secuiry-fe";
import {modals} from "../modal/modals";
import {ChangePasswordModal} from "./change-password-modal";
import React from "react";
import {confirmModal} from "../confirm-modal/confirm-modal";
import {ConfigModal} from "./config-modal";

export const navItems = (user) => {

    const permission = permissionInfo.getPermission();

    return [{
        label: "Hoá Đơn",
        to: "/",
        hide: () => permission[user.role].indexOf("bill.create") == -1,
        icon: <i className="fa fa-file-text-o nav-icon"/>
    }, {
        label: "Đơn Hàng",
        icon: <i className="fa fa-list nav-icon"/>,
        child: [{
            label: "Đơn Chính",
            to: "/orders",
            hide: () => permission[user.role].indexOf("bill.view") == -1
        }, {
            label: "Đơn Sẵn",
            to: "/draft",
            hide: () => permission[user.role].indexOf("bill.view") == -1
        }, {
            label: "Đơn Chờ Làm",
            to: "/florist",
            hide: () => user.role != "florist"
        }, {
            label: "Đơn Chờ Ship",
            to: "/ship",
            hide: () => user.role != "ship"
        }],
        hide: () => user.role != "ship" && user.role != "florist" && user.role != "sale" && !permission[user.role].find(r => r.indexOf("bill") > -1)
    }, {
        label: "Báo Cáo",
        icon: <i className="fa fa-bar-chart nav-icon"/>,
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
        }],
        hide: () => !permission[user.role].find(r => r.indexOf("report") > -1)
    },
        {
            label: "Khách Hàng",
            icon: <i className="fa fa-users nav-icon"/>,
            child: [{
                label: "Danh Sách Khách Hàng",
                to: "/customers",
                hide: () => permission[user.role].indexOf("customer.list") == -1
            }, {
                label: "VIP",
                to: "/vip",
                hide: () => permission[user.role].indexOf("customer.vip.view") == -1
            }],
            hide: () => !permission[user.role].find(r => r.indexOf("customer") > -1)
        }, {
            label: "Chiến Dịch Khuyến Mại",
            to: "/promotion",
            icon: <i className="fa fa-gift nav-icon"/>,
            hide: () => !permission[user.role].find(r => r.indexOf("promotion") == 0)
        }, {
            label: "Kho Ảnh",
            to: "/gallery",
            icon: <i className="fa fa-picture-o nav-icon"/>,
            hide: () => false
        },{
            label: "Kho",
            icon: <i className="fa fa-truck nav-icon"/>,
            child: [{
                to: "/products",
                label: "Danh Sách Sản Phẩm",
                hide: () => !permission[user.role].find(r => r.indexOf("warehouse.product") > -1)
            }, {
                to: "/request-warehouse",
                label: "Phiếu Xuất Nhập Kho",
                hide: () => !permission[user.role].find(r => r.indexOf("warehouse.request") > -1)
            }, {
                to: "/warehouse",
                label: "Tồn Kho",
                hide: () => false
            }],
            hide: () => !permission[user.role].find(r => r.indexOf("warehouse") > -1)
        }, {
            label: "Quản Lý Hệ Thống",
            icon: <i className="fa fa-cog nav-icon"/>,
            hide: () => user.role != "admin",
            child: [{
                label: "Quản Lý Cơ Sở",
                to: "/manage-premises",
                hide: () => user.role != "admin"
            }, {
                label: "Quản Lý Tài Khoản",
                to: "/manage-user",
                hide: () => user.role != "admin"
            }, {
                label: "Quản Lý Nhà Cung Cấp",
                to: "/manage-supplier",
                hide: () => user.role != "admin"
            }, {
                to: "/manage-role",
                label: "Phân Quyền",
                hide: () => user.role != "admin"
            }, {
                to: "/setting",
                label: "Cài Đặt Màu, Loại",
                hide: () => !security.isHavePermission(["bill.editProductColor", "bill.editProductType"])
            }],
        }]
};

//
// {
//     label: "Cơ Sở",
//       child: [{
//     label: "Quản Lý Cơ Sở",
//     to: "/manage-premises",
//     hide: () => user.role != "admin"
// }, ..._premises],
// }, {
//     label: "Tài Khoản",
//       child: [{
//         label: "Đổi Mật Khẩu",
//         click: () => {

//         }
//     }, {
//         label: "Quản Lý Nhân Viên",
//         to: "/manage-user",
//         hide: () => user.role != "admin"
//     },{
//         label: "Phân Quyền",
//         to: "/manage-role",
//         hide: () => user.role != "admin"
//     }, {
//         label: "Thoát",
//         click: () => {
//             security.logout();
//         }
//
//     }]
// }