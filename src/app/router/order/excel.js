import moment from "moment";
import {
    getTotalBill,
    getTotalBillDiscount,
    getTotalBillItems,
    getTotalBillVAT,
    getTotalBillWithoutVAT
} from "../../common/common";
import {premisesInfo} from "../../security/premises-info";
import sortBy from "lodash/sortBy";

export const getCSVData = (bills, hasReason) => {


    let header = [
        "Ngày giao hàng",
        "Giờ nhận",
        "Mã đơn hàng",
        "Nội dung đơn hàng",
        "Họ và tên khách hàng",
        "Giá trị đơn hàng chưa bao gồm thuế",
        "Tên cửa hàng",
        "Hình thức thanh toán",
        "Chiết khấu",
        "Ship",
        "Florist 1",
        "Florist 2",
        "Florist 3",
        "Florist 4",
        "Sale 1",
        "Sale 2",
        "Sale 3",
        "Sale 4",
        'Ngày bán hàng',
        "Ghi chú",
        "Nội dung thiệp",
        "Tiền Hàng",
        "Tổng VAT",
        "Tổng Tiền",
        "Phí Ship",
        "Phụ Thu",
        "Người hưởng 1",
        "Người hưởng 2",
        "Người hưởng 3",
        "Người hưởng 4",
    ];

    if (hasReason) {
        header.push("Lí do");
    }

    let csvData = [header];


    const generateBillItemsText = (items) => {
        let ret = "";
        for (let item of items) {
            ret += `${item.quantity} ${item.name} ${item.sale ? `(${item.sale}%)` : ''}\n`
        }
        return ret;
    };


    if (bills) {
        for (let bill of sortBy(bills, b => b.deliverTime)) {
            let ret = [];
            ret.push(moment(bill.deliverTime).format("DD/MM/YYYY"));
            ret.push(moment(bill.deliverTime).format("HH:mm"));
            ret.push(bill.bill_number);
            ret.push(generateBillItemsText(bill.items));
            ret.push(bill.customer.customerName || "");
            ret.push(getTotalBillWithoutVAT(bill));
            ret.push(premisesInfo.getActivePremise().name);
            ret.push(bill.to.paymentType || "");
            ret.push(getTotalBillDiscount(bill));
            ret.push(bill.ships && bill.ships[0] ? bill.ships[0].username : "");


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
            };


            ret.push(moment(bill.created).format("DD/MM/YYYY"));
            ret.push(bill.to.notes || "");
            ret.push(bill.to.cardContent || "");
            ret.push(getTotalBillItems(bill));
            ret.push(getTotalBillVAT(bill));
            ret.push(getTotalBill(bill));
            ret.push(bill.to.shipMoney);
            ret.push(bill.surcharge);
            ret.push(bill.surchargeMember[0] ? bill.surchargeMember[0].username : "");
            ret.push(bill.surchargeMember[1] ? bill.surchargeMember[1].username : "");
            ret.push(bill.surchargeMember[2] ? bill.surchargeMember[2].username : "");
            ret.push(bill.surchargeMember[3] ? bill.surchargeMember[3].username : "");

            if (hasReason) {
                ret.push(bill.reason)
            }

            csvData.push(ret);
        }
    }

    return csvData;
};