import moment from "moment";
import {
    getTotalBill,
    getTotalBillDiscount,
    getTotalBillItems,
    getTotalBillVAT,
    getTotalBillWithoutVAT
} from "../../common/common";

export const getCSVData = (bills) => {


    let csvData =[
        [
            'Hoá đơn #',
            'Ngày đặt hàng',
            'Ngày giao hàng',
            "Giờ nhận",
            "Sale 1",
            "Sale 2",
            "Sale 3",
            "Sale 4",
            "Florist 1",
            "Florist 2",
            "Florist 3",
            "Florist 4",
            "Ship",
            "Hình thức thanh toán",
            "Tên Khách Đặt",
            "Địa Chỉ Khách Đặt",
            "Số ĐT",
            "Tên Khách Nhận",
            "Địa Chỉ Nhận",
            "SĐT Khách Nhận",
            "Ghi chú",
            "Nội dung thiệp",
            "Mặt Hàng",
            "Tiền Hàng",
            "Tiền Chiết Khấu",
            "Tổng VAT",
            "Tổng Tiền",
        ]
    ];

    const generateBillItemsText = (items) => {
        let ret = "";
        for (let item of items) {
            ret += `${item.quantity} ${item.name} ${item.sale ? `(${item.sale}%)` : ''}\n`
        }
        return ret;
    };

    if (bills) {
        for (let bill of bills) {
            let ret = [];
            ret.push(bill.bill_number);
            ret.push(moment(bill.created).format("DD/MM/YYYY"));
            ret.push(moment(bill.deliverTime).format("DD/MM/YYYY"));
            ret.push(moment(bill.deliverTime).format("HH:mm"));
            if (bill.sales) {
                ret.push(bill.sales[0] ? bill.sales[0].username : "");
                ret.push(bill.sales[1] ? bill.sales[1].username : "");
                ret.push(bill.sales[2] ? bill.sales[2].username : "");
                ret.push(bill.sales[3] ? bill.sales[3].username : "");

            } else {
                ret.push(bill.to.saleEmp);
                ret.push("");
                ret.push("");
                ret.push("");
            }

            if (bill.florists) {
                ret.push(bill.florists[0] ? bill.florists[0].username : "");
                ret.push(bill.florists[1] ? bill.florists[1].username : "");
                ret.push(bill.florists[2] ? bill.florists[2].username : "");
                ret.push(bill.florists[3] ? bill.florists[3].username : "");

            } else {
                ret.push(bill.to.florist);
                ret.push("");
                ret.push("");
                ret.push("");
            }
            ret.push(bill.ships && bill.ships[0] ? bill.ships[0].username : "");
            ret.push(bill.to.paymentType || "");
            ret.push(bill.customer.customerName || "");
            ret.push(bill.customer.customerPlace || "");
            ret.push(bill.customer.customerPhone || "");
            ret.push(bill.to.receiverName || "");
            ret.push(bill.to.receiverPlace || "");
            ret.push(bill.to.receiverPhone || "");

            ret.push(bill.to.notes || "");
            ret.push(bill.to.cardContent || "");
            ret.push(generateBillItemsText(bill.items));
            ret.push(getTotalBillItems(bill));
            ret.push(getTotalBillDiscount(bill));
            ret.push(getTotalBillVAT(bill));
            ret.push(getTotalBill(bill));
            csvData.push(ret);
        }
    }

    return csvData;
};