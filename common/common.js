const sumBy = require("lodash/sumBy");
const isEmpty = require("lodash/isEmpty");

module.exports = {
    getTotalBill: (bill) => {
        if ((bill.status == "Done" || bill.status == "Khiếu Nại") && bill.to.paymentType.indexOf("Free") == -1) {
            let totalBillItems = sumBy(bill.items, item => {
                let price = item.price * item.quantity;
                if (item.sale) {
                    price = price - price * item.sale / 100
                }

                if (item.vat) {
                    price = price + price * item.vat / 100
                }

                if (bill.payOwe && bill.customerInfo) {
                    price += bill.customerInfo.spend.totalOwe
                }

                return price;
            });

            let discount = 0;

            if (bill.vipSaleType == "Giảm giá 5%") {
                discount += 5;
            }

            if (bill.vipSaleType == "Giảm giá 10%") {
                discount += 10;
            }

            if (bill.vipSaleType == "Giảm giá 20%") {
                discount += 20;
            }

            if (bill.vipSaleType == "Giảm giá 30%") {
                discount += 30;
            }



            if (bill.promotion && bill.promotion.discount) {
                discount += bill.promotion.discount;
            }


            return totalBillItems - totalBillItems * Math.min(discount, 100) / 100
        }

        return 0;

    }
};