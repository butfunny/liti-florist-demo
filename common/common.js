const sumBy = require("lodash/sumBy");

module.exports = {
    getTotalBill: (bill) => {
        let items = bill.items;
        return sumBy(items, item => {
            let price = item.price * item.quantity;
            if (item.discount) {
                price = price - price * item.discount / 100
            }

            if (item.vat) {
                price = price + price * item.vat / 100
            }

            return price;
        })
    }
};