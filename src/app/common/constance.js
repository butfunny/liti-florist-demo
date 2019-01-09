export const paymentTypes = ["Tất cả", "Ship", "Shop", "Thẻ", "Chuyển Khoản", "Paypal", "Free", "Nợ"];
export const viaTypes = ["Đến Shop", "Facebook / Instargram", "Website", "Điện thoại (viber, zalo, imess, cố định)", "Khác (Now, đối tác, voucher...)"];

export const roles = [{
    value: "admin",
    label: "Ban Giám Đốc"
}, {
    value: "mkt",
    label: "Marketing"
}, {
    value: "tch",
    label: "Trưởng Cửa Hàng"
}, {
    value: "dvkh",
    label: "Dịch Vụ Khách Hàng"
}, {
    value: "bpmh",
    label: "BP Mua Hàng"
}, {
    value: "sale",
    label: "Sale"
}, {
    value: "salemanager",
    label: "Sale Manager"
}, {
    value: "florist",
    label: "Florist"
}, {
    value: "ship",
    label: "Ship"
}, {
    value: "ns",
    label: "Nhân Sự"
}, {
    value: "ktt",
    label: "Kế Toán Trưởng"
}, {
    value: "kt",
    label: "Kế Toán"
}, {
    value: "nl",
    label: "Nhập Liệu"
}, {
    value: "khotong",
    label: "Kho Tổng"
}, {
    value: "guest",
    label: "Khách"
}];

export const permissions = [{
    value: "bill.create",
    father: "Hoá Đơn",
    label: "Tạo Đơn"
}, {
    value: "bill.edit",
    father: "Hoá Đơn",
    label: "Sửa Đơn"
}, {
    value: "bill.delete",
    label: "Xoá Đơn",
    father: "Hoá Đơn",
}, {
    value: "bill.editProductType",
    father: "Hoá Đơn",
    label: "Chỉnh sửa loại sản phẩm"
}, {
    value: "bill.editProductColor",
    father: "Hoá Đơn",
    label: "Chỉnh sửa màu sản phẩm"
}, {
    value: "bill.editDoneBill",
    father: "Hoá Đơn",
    label: "Chỉnh sửa hoá đơn Done"
}, {
    value: "bill.view",
    label: "Xem Đơn Hàng",
    father: "Hoá Đơn"
}, {
    value: "bill.excel",
    label: "Xuất Excel",
    father: "Hoá Đơn"
}, {
    value: "report.report-revenue",
    label: "Báo cáo doanh thu",
    father: "Báo Cáo"
}, {
    value: "report.report-bill",
    label: "Báo cáo đơn hàng",
    father: "Báo Cáo"
}, {
    value: "report.report-customer",
    label: "Báo cáo khách hàng",
    father: "Báo Cáo"
}, {
    value: "report.report-promotion",
    label: "Báo cáo chiến dịch khuyến mại",
    father: "Báo Cáo"
}, {
    value: "gallery",
    label: "Tải ảnh vào kho ảnh",
    father: "Kho Ảnh"
}, {
    value: "customer.list",
    label: "Danh Sách Khách Hàng",
    father: "Khách Hàng"
}, {
    value: "customer.vip.view",
    label: "Xem hoặc tạo khách VIP",
    father: "Khách Hàng"
}, {
    value: "promotion.view",
    label: "Xem Chiến Dịch",
    father: "Khuyến Mại"
}, {
    value: "promotion.create",
    label: "Thêm Chiến Dịch",
    father: "Khuyến Mại"
}, {
    value: "promotion.edit",
    label: "Sửa Chiến Dịch",
    father: "Khuyến Mại"
}, {
    value: "promotion.remove",
    label: "Xoá Chiến Dịch",
    father: "Khuyến Mại"
}, {
    value: "warehouse.products.view",
    label: "Xem Danh Sách Sản Phẩm",
    father: "Kho"
}, {
    value: "warehouse.products.update",
    label: "Chỉnh Sửa Danh Sách Sản Phẩm",
    father: "Kho"
},  {
    value: "warehouse.request.view-request-from-supplier",
    label: "Xem Phiếu Nhập Hàng",
    father: "Kho"
}, {
    value: "warehouse.request.create-request-from-supplier",
    label: "Tạo Phiếu Nhập Hàng",
    father: "Kho"
},{
    value: "warehouse.request.update-request-from-supplier",
    label: "Duyệt Phiếu Nhập Hàng",
    father: "Kho"
},{
    value: "warehouse.request.view-return-to-supplier",
    label: "Xem Phiếu Trả Hàng",
    father: "Kho"
}, {
    value: "warehouse.request.create-return-to-supplier",
    label: "Tạo Phiếu Trả Hàng",
    father: "Kho"
},{
    value: "warehouse.request.update-return-to-supplier",
    label: "Duyệt Phiếu Trả Hàng",
    father: "Kho"
}, {
    value: "warehouse.request.view-transfer-to-subwarehouse",
    label: "Xem Phiếu Xuất Kho",
    father: "Kho"
}, {
    value: "warehouse.request.create-transfer-to-subwarehouse",
    label: "Tạo Phiếu Xuất Kho",
    father: "Kho"
},{
    value: "warehouse.request.update-transfer-to-subwarehouse",
    label: "Duyệt Phiếu Xuất Kho",
    father: "Kho"
}, {
    value: "warehouse.request.view-return-to-base",
    label: "Xem Phiếu Trả Kho",
    father: "Kho"
}, {
    value: "warehouse.request.create-return-to-base",
    label: "Tạo Phiếu Trả Kho",
    father: "Kho"
},{
    value: "warehouse.request.update-return-to-base",
    label: "Duyệt Phiếu Trả Kho",
    father: "Kho"
}, {
    value: "warehouse.request.view-report-flower",
    label: "Xem Phiếu Hao Hụt / Hủy Hỏng",
    father: "Kho"
}, {
    value: "warehouse.request.create-report-flower",
    label: "Tạo Phiếu Hao Hụt / Hủy Hỏng",
    father: "Kho"
},{
    value: "warehouse.request.update-report-flower",
    label: "Duyệt Phiếu Hao Hụt / Hủy Hỏng",
    father: "Kho"
}, {
    value: "warehouse.view-ori-price",
    label: "Xem giá gốc",
    father: "Kho"
}];

export const catalogs = ["Hoa chính", "Hoa lá phụ/Lá", "Phụ kiện", "Cost"];
