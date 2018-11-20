import sumBy from "lodash/sumBy";

export let formatNumber = (numb = 0) => numb.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

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

    return Math.ceil(totalBillItems - totalBillItems * Math.min(discount, 100) / 100)

};

export const getTotalBillVAT = (bill) => {
    return Math.ceil(sumBy(bill.items, item => {
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

    return Math.ceil(totalBillItems - totalBillItems * Math.min(discount, 100) / 100)

};



export const getSalary = (user, bill) => {
    const billTotal = getTotalBill(bill);
    let charge = 0;

    if (user.role == "florist") {
        const found = bill.florists && bill.florists.find(u => u.user_id == user._id);
        if (found) charge += 3;

        const isSale = bill.sales && bill.sales.find(u => u.user_id == user._id);
        if (isSale) charge += 0.9;
    }

    if (user.role == "sale") {
        charge = 1.8;
    }

    if (user.role == "ship") {
        return {
            money: parseInt(bill.to.shipMoney),
            percent: null
        };
    }

    return {
        money: billTotal * charge / 100,
        percent: charge
    };

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
    var perferedWidth = 750;
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
}