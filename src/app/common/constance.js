export const paymentTypes = ["Tất cả", "Ship", "Shop", "Thẻ", "Chuyển Khoản", "Paypal", "Nợ"];
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
    label: "Xoá loại sản phẩm"
}, {
    value: "bill.editProductColor",
    father: "Hoá Đơn",
    label: "Xoá màu sản phẩm"
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
    value: "report.gallery",
    label: "Kho ảnh",
    father: "Báo Cáo"
}, {
    value: "customer.list",
    label: "Danh sách khách hàng",
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
    value: "warehouse.view",
    label: "Xem Kho",
    father: "Kho"
}, {
    value: "warehouse.create",
    label: "Thêm sản phẩm vào kho tổng",
    father: "Kho"
}, {
    value: "warehouse.edit",
    label: "Sửa sản phẩm kho tổng",
    father: "Kho"
}, {
    value: "warehouse.remove",
    label: "Xoá sản phẩm kho tổng",
    father: "Kho"
}, {
    value: "warehouse.request.create",
    label: "Tạo phiếu XNK",
    father: "Kho"
}, {
    value: "warehouse.request.view",
    label: "Xem phiếu XNK",
    father: "Kho"
}, {
    value: "warehouse.request.edit",
    label: "Xác nhận / Từ chối phiếu XNK",
    father: "Kho"
}];
