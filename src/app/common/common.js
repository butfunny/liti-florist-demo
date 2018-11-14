import sumBy from "lodash/sumBy";

export let formatNumber = numb => numb.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

export const getTotalBill = (bill) => {

    let totalBillItems = sumBy(bill.items, item => {
        let price = item.price * item.quantity;
        if (item.sale) {
            price = price - price * item.sale / 100
        }

        if (item.vat) {
            price = price + price * item.vat / 100
        }

        return price;
    });

    if (bill.payOwe && bill.customerInfo) {
        totalBillItems += bill.customerInfo.spend.totalOwe
    }

    let discount = 0;

    if (bill.vipSaleType == "Giảm giá 5%") {
        discount += 5;
    }

    if (bill.vipSaleType == "Giảm giá 20%") {
        discount += 20;
    }

    if (bill.promotion) {
        discount += bill.promotion.discount
    }

    return totalBillItems - totalBillItems * Math.min(discount, 100) / 100

};




export const getShipFees = (deliverTime, distance) => {
    if (new Date(deliverTime).getHours() >= 18 && new Date(deliverTime).getMinutes() >= 30) {
        return 30000
    }

    if (distance < 10) {
        return 15000;
    }

    return 20000;
};

export const formatValue = (value) => {
    if (value < 10) return `0${value}`;
    return value
};

export const filteredByKeys = (obj, keys, keyword) => {
    return obj.filter(item => {
        for (let key of keys) {
            if (key.indexOf(".") > -1) {
                const arr = key.split(".");
                if (item[arr[0]] && item[arr[0]][arr[1]] && item[arr[0]][arr[1]].toLowerCase().indexOf(keyword.toLowerCase()) > -1) return true;

            } else {
                if (item[key] && item[key].toLowerCase().indexOf(keyword.toLowerCase()) > -1) return true;
            }
        }

        return false;
    })
};

export const getDates = function (startDate, endDate) {
    let dates = [],
        currentDate = startDate,
        addDays = function (days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
};

export const generateDatas = (item, qty) => {
    let ret = [];
    for (let i = 0; i < qty; i++) {
        ret.push(item)
    }

    return ret;
};

export const keysToArray = (obj) => {
    let ret = [];
    for (let key in obj) {
        ret.push({
            key,
            value: obj[key]
        })
    };

    return ret;
};
