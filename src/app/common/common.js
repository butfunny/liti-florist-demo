import sumBy from "lodash/sumBy";

export let formatNumber = numb => numb.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

export const getTotalBill = (items) => sumBy(items, item => {
    const price = item.price * item.qty;
    if (item.discount) {
        return price - price * item.discount / 100
    }
    return price;
});

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

export const getDates = function(startDate, endDate) {
    let dates = [],
        currentDate = startDate,
        addDays = function(days) {
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
