import sumBy from "lodash/sumBy";

export let formatNumber = (numb = 0) => parseInt(numb).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

export const getTotalBill = (bill) => {

    if (bill.to && bill.to.paymentType && bill.to.paymentType.indexOf("Free") > -1) return 0;

    if (bill.status == "Huỷ Đơn") return 0;

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


    return Math.round(totalBillItems - totalBillItems * Math.min(discount, 100) / 100)

};

export const getBillProfit = (bill) => {
    if (bill.selectedFlower) {
        return getTotalBill(bill) - sumBy(bill.selectedFlower, (item) => item.oriPrice || 0);
    }

    return 0;
};

export const getTotalBillItems = (bill) => {
    return Math.round(sumBy(bill.items, item => {
        return item.price * item.quantity
    }));

};

export const getTotalBillDiscount = (bill) => {
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

    let totalDiscount = sumBy(bill.items, item => {
        let price = item.price * item.quantity;
        if (item.sale)  return price * item.sale / 100;
        return 0;
    });

    let discount = 0;

    if (bill.vipSaleType == "Giảm giá 5%") {
        discount += 5;
    }

    if (bill.vipSaleType == "Giảm giá 20%") {
        discount += 20;
    }

    if (bill.promotion) {
        discount += bill.promotion.discount
    };

    return Math.round(totalDiscount + totalBillItems * Math.min(discount, 100) / 100)
};


export const getTotalBillVAT = (bill) => {
    return Math.round(sumBy(bill.items, item => {
        let price = item.price * item.quantity;
        if (item.vat) return price * item.vat / 100;
        return 0
    }));

};


export const getTotalBillWithoutVAT = (bill) => {

    let totalBillItems = sumBy(bill.items, item => {
        let price = item.price * item.quantity;
        if (item.sale) {
            price = price - price * item.sale / 100
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

    return Math.round(totalBillItems - totalBillItems * Math.min(discount, 100) / 100)

};

export const getSubTotalBill = (bill) => {
    return sumBy(bill.items, item => {
        return item.price * item.quantity;
    });
}

export const getTotalBillWithouDiscount = (bill) => {

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

    return Math.round(totalBillItems - totalBillItems * Math.min(discount, 100) / 100)

};




export const getSalary = (user, bill) => {

    const billTotal = getSubTotalBill(bill);
    let charge = 0;

    if (bill.status != "Done") {
        return 0;
    }

    let discount = 0;

    for (let item of bill.items) {
        if (item.sale) discount += item.sale
    }

    if (bill.vipSaleType == "Giảm giá 5%") {
        discount += 5;
    }

    if (bill.vipSaleType == "Giảm giá 20%") {
        discount += 20;
    }

    if (bill.promotion) {
        discount += bill.promotion.discount
    }

    if (discount > 20) {
        return 0;
    }

    let isOnl = false;

    if (user.role == "florist") {
        const found = bill.florists && bill.florists.find(u => u.user_id == user._id);
        if (found) charge += 3 / bill.florists.length;

        const isSale = bill.sales && bill.sales.find(u => u.user_id == user._id);
        if (isSale) {
            let myUser = bill.sales.find(u => u.username == user.username);
            if (myUser.isOnl) {
                charge += 0.9 * 60 / 100;
                isOnl = true;
            } else {
                let isHaveSaleOnl = bill.sales.find(u => u.username.indexOf("onl") > -1);
                if (isHaveSaleOnl) {
                    charge += (0.9 - (0.9 * 60 / 100)) / bill.sales.length - 1
                } else {
                    charge += 0.9 / (bill.sales.length)
                }
            }
        }
    }


    if (user.role == "sale") {

        let myUser = bill.sales.find(u => u.username == user.username);
        if (myUser.isOnl) {
            charge += 1.8 * 60 / 100;
            isOnl = true;
        } else {
            let isHaveSaleOnl = bill.sales.find(u => u.isOnl);
            if (isHaveSaleOnl) {
                charge += (1.8 - (1.8 * 60 / 100)) / (bill.sales.length - 1);
            } else {
                charge += 1.8 / (bill.sales.length)
            }
        }
    }

    if (user.role == "ship") {

        const getSalary = () => {
            if (new Date(bill.to.deliverTime).getHours() >= 18 && new Date(bill.to.deliverTime).getMinutes() >= 30) {
                return 30000
            }

            if ((bill.to.distance || 0) < 10) {
                return 15000;
            }

            return 20000;
        };

        return {
            money: getSalary(),
            percent: null,
            isOnl
        };
    }

    return {
        money: billTotal * charge / 100,
        percent: charge,
        isOnl
    };

};


export const getShipFees = (bill, distance) => {

    const billTotal = getTotalBill(bill);

    if (billTotal >= 600000) {
        if (bill.vipSaleType) {
            if (distance <= 8) return 0;
            return 5000 * Math.round(distance);
        } else {
            if (distance <= 5) return 0;
            return 5000 *  Math.round(distance);
        }
    } else {
        return 5000 *  Math.round(distance)
    }



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


export const resizeImage = (file) => {
    return new Promise((resolve, reject)=>{
        resizeImages(file, function(dataUrl) {
            resolve(dataURItoBlob(dataUrl));
        });
    })
};

function resizeImages(file, complete) {
    // read file as dataUrl
    ////////  2. Read the file as a data Url
    var reader = new FileReader();
    // file read
    reader.onload = function(e) {
        // create img to store data url
        ////// 3 - 1 Create image object for canvas to use
        var img = new Image();
        img.onload = function() {
            /////////// 3-2 send image objeclt to function for manipulation
            complete(resizeInCanvas(img));
        };
        img.src = e.target.result;
    };
    // read file
    reader.readAsDataURL(file);

}

function resizeInCanvas(img){
    /////////  3-3 manipulate image
    var perferedWidth = 400;
    var ratio = perferedWidth / img.width;
    var canvas = $("<canvas>")[0];
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0,0,canvas.width, canvas.height);
    //////////4. export as dataUrl
    return canvas.toDataURL();
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
};

export function getStartAndLastDayOfWeek(curr = new Date()) {
    let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    let last = first + 6; // last day is the first day + 6
    let from = new Date(curr.setDate(first));
    let to = new Date(curr.setDate(last));

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 99);


    if (from.getTime() > to.getTime()) {
        to.setMonth(to.getMonth() + 1);
    }

    return {
        from, to
    }
}