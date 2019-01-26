import moment from "moment";
import {security} from "../../security/secuiry-fe";

export const warehouseCSVData = (items, suppliers) => {
    let ret = [[
        "Ngày Nhập Kho",
        "Hạn Sử Dụng",
        "Tên",
        "Mã",
        "Nhập",
        "Tồn",
        "Xuất",
        "Hao Hụt",
        "Hủy Hỏng",
        "Đã Bán",
        "Loại",
        "Nhà Cung Cấp",
        "Giá Gốc",
        "Giá Bán",
        "Tổng Tồn"
    ]];

    for (let row of items) {
        ret.push([
            moment(row.created).format("DD/MM/YYYY hh:MM"),
            moment(row.expireDate).format("DD/MM/YYYY"),
            row.name,
            row.productID,
            row.importedQuantity,
            row.quantity,
            row.exported,
            row.missing,
            row.error,
            row.used,
            row.catalog,
            suppliers.find(s => s._id == row.supplierID).name,
            security.isHavePermission(["warehouse.view-ori-price"]) ? row.oriPrice : "",
            row.price,
            row.price * row.quantity
        ])
    }

    return ret;
};

export const subwWarehouseCSVData = (items, suppliers) => {
    let ret = [[
        "Ngày Nhập Kho",
        "Hạn Sử Dụng",
        "Mã",
        "Tên",
        "Tồn",
        "Hao Hụt",
        "Hủy Hỏng",
        "Đã Bán",
        "Loại",
        "Nhà Cung Cấp",
        "Giá Gốc",
        "Giá Bán",
        "Tổng Tồn"
    ]];

    for (let row of items) {
        ret.push([
            moment(row.created).format("DD/MM/YYYY hh:MM"),
            moment(row.expireDate).format("DD/MM/YYYY"),
            row.productID,
            row.name,
            row.quantity,
            row.missing,
            row.error,
            row.used,
            row.catalog,
            suppliers.find(s => s._id == row.supplierID).name,
            security.isHavePermission(["warehouse.view-ori-price"]) ? row.oriPrice : "",
            row.price,
            row.price * row.quantity
        ])
    }

    return ret;
};
