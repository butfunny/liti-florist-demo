const {getTotalBill} = require("./common/common");
const gulp = require("gulp");
const nodemon = require('gulp-nodemon');
const spawn = require('child_process').spawn;
const run = require('gulp-run');
const fs = require('fs');
const fse = require('fs-extra');
const crypto = require("crypto");
const _ = require("lodash");

function makeid() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const stylusCompiler = {
    watch: (desk) => {
        require("./compile-stylus").createCompiler(desk).watch();
    },
    compile(desk) {
        return Promise.all([
            require("./compile-stylus").createCompiler(desk).compile(),
        ]);
    }
};

const startServer = () => {
    nodemon({
        script: './dev/dev-server.js',
        ext: 'js',
        "ignore": [
            ".idea/",
            ".git/",
            "gulpfile.js",
            "src/",
            "dev/assets",
            "node_modules/"
        ],
        env: {'NODE_ENV': 'development'}
    });
};


gulp.task("dev", () => {
    startServer();
    stylusCompiler.watch("./dev/assets/css");
    if (!/^win/.test(process.platform)) { // linux
        spawn("webpack", ["--watch"], {stdio: "inherit"});
    } else {
        spawn('cmd', ['/s', "/c", "webpack", "--watch"], {stdio: "inherit"});
    }
});

let packageAssets = function () {
    gulp.src(["./dev/**", "!./dev/assets/js/**"])
        .pipe(gulp.dest("./build"));
};

gulp.task("package-assets", packageAssets);

gulp.task("deploy", (done) => {
    packageAssets();
    stylusCompiler.compile("./build/assets/css").then(() => {
        console.log("Running Webpack");
        run("webpack --config webpack.config.prod").exec(() => {
            console.log("webpack done");
            run('git commit -am "Deploy"').exec(() => {
                run('git push heroku master').exec((log) => {
                    console.log("deployed");
                    done();
                })
            })
        });
    })
});

gulp.task("build-prod", () => {
    packageAssets();
    stylusCompiler.compile("./build/assets/css").then(() => {
        let hash = makeid();
        let html = fs.readFileSync("./build/index.html", {encoding: "utf8"});
        html = html.replace(`"/assets/css/style.css"`, `"/assets/css/style.css?v=${hash}"`);
        html = html.replace(`"/assets/js/client-loader.js"`, `"/assets/js/client-loader.js?v=${hash}"`);
        fs.writeFileSync("./build/index.html", html);

        run("webpack --config webpack.config.prod").exec(() => {
            console.log("Build done");
        });
    })

})

gulp.task("create-default-admin", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});

    const UserDao = require("./dao/user-dao");

    UserDao.create({
        username: "cuongnguyen",
        role: "admin",
        password: crypto.createHash('md5').update("123123").digest("hex")
    }, (err, user) => {
        mongoose.disconnect();
        console.log(user);
    })
});

gulp.task("create-premises", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const ShopDao = require("./dao/shop-dao");
    ShopDao.create([{base_id: null, name: "Phố Huế", address: "số 3 Phố Huế, Hà Nội"}, {
        base_id: 2,
        name: "Kim Mã",
        address: "229 Kim Mã, Ba Đình, Hà Nội"
    }, {
        base_id: 3,
        name: "Trần Duy Hưng",
        address: "51 Trần Duy Hưng, Hà Nội"
    }, {
        base_id: 4,
        name: "Hai Bà Trưng",
        address: "357 Hai Bà Trưng, Hồ Chí Minh"
    }, {
        base_id: 5,
        name: "Quang Trung",
        address: "306 Quang Trung, Hà Đông, Hà Nội"
    }], () => {
        mongoose.disconnect();
    })
});

gulp.task("update-bill-with-premies", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const ShopDao = require("./dao/shop-dao");
    const BillDao = require("./dao/bill-dao");

    const updateBill = (baseID, id) => {
        return new Promise((resolve, reject)=>{
            BillDao.update({base_id: baseID}, {premises_id: id}, {multi: true}, (err) =>{
                console.log("updated: " + baseID);
                resolve();
            })
        })

    };

    ShopDao.find({}, (err, shops) => {
        let promises = [];
        for (let shop of shops) {
            promises.push(updateBill(shop.base_id, shop._id))
        }

        Promise.all(promises).then(() => {
            console.log("finished");
            mongoose.disconnect();
        })
    })
});

gulp.task("update-vip", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const VipDao = require("./dao/vip-dao");

    VipDao.update({}, {vipType: "VIP"}, {multi: true}, (err) =>{
        console.log("finished");
        mongoose.disconnect();
    });
});

gulp.task("update-vip-deadline", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const VipDao = require("./dao/vip-dao");

    const updateCustomer = (vip) => {
        return new Promise((resolve, reject)=>{
            let today = new Date(vip.created);
            today.setFullYear(today.getFullYear() + 2);
            VipDao.findOneAndUpdate({_id: vip._id}, {endDate: today}, (err) =>{
                console.log("updated: " + vip._id);
                resolve();
            })
        })

    };

    VipDao.find({}, (err, vips) => {
        let promises = [];
        for (let vip of vips) {
            promises.push(updateCustomer(vip))
        }

        Promise.all(promises).then(() => {
            console.log("finished");
            mongoose.disconnect();
        })
    })
});


gulp.task("update-customer-birthdate", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const CustomerDao = require("./dao/customer-dao");
    const VipDao = require("./dao/vip-dao");

    const updateCustomer = (customerID, birthDate) => {
        return new Promise((resolve, reject)=>{
            CustomerDao.findOneAndUpdate({_id: customerID}, {birthDate: birthDate}, (err) =>{
                console.log("updated: " + customerID);
                resolve();
            })
        })

    };

    VipDao.find({}, (err, vips) => {
        let promises = [];
        for (let vip of vips) {
            promises.push(updateCustomer(vip.customerId, vip.birthDate))
        }

        Promise.all(promises).then(() => {
            console.log("finished");
            mongoose.disconnect();
        })
    })
});

gulp.task("update-customer-pay", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const CustomerDao = require("./dao/customer-dao");
    const BillDao = require("./dao/bill-dao");


    const updateCustomerPay = (customerId) => {
        return new Promise((resolve, reject)=>{
            BillDao.find({customerId: customerId}, (err, bills) => {
                let totalPay = _.sumBy(bills, b => getTotalBill(b));
                CustomerDao.findOneAndUpdate({_id: customerId}, {totalPay: totalPay, totalBill: bills.length}, () => {
                    resolve();
                })
            })
        })
    };


    CustomerDao.find({}, (err, customers) => {

        const upload = (index) => {
            if (index == customers.length - 1) {
                console.log("finished");
                mongoose.disconnect();
            } else {
                let item = customers[index];
                console.log(`${index}/${customers.length}`);
                updateCustomerPay(item.id).then(() => {
                    upload(index + 1)
                })
            }
        };

        upload(0);

        // for (let customer of customers) {
        //     CustomerDao.find({customerPhone: customer.customerPhone}, (err, found) => {
        //         if (found._id != customer._id) {
        //             BillDao.findOneAndUpdate({customerId: found._id}, {customerId: customer._id}, (err, bill) => {
        //                 console.log("updated bill: " + bill._id);
        //                 CustomerDao.remove({_id: found._id}, () => {
        //                     console.log("removed same customer: " + found._id);
        //                 })
        //             })
        //         }
        //     })

        // }

    })

});

gulp.task("update-customer-same", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const CustomerDao = require("./dao/customer-dao");
    const BillDao = require("./dao/bill-dao");
    const VipDao = require("./dao/vip-dao");

    const updateCustomerSame = (customer) => {
        return new Promise((resolve, reject)=>{
            CustomerDao.findOne({customerPhone: customer.customerPhone}, (err, found) => {
                if (found._id.toString() != customer._id) {
                    BillDao.updateMany({customerId: customer._id}, {customerId: found._id}, (err, bill) => {
                        VipDao.updateMany({customerId: customer._id}, {customerId: found._id}, () => {
                            CustomerDao.deleteOne({_id: customer._id}, () => {
                                console.log("removed same customer: " + customer._id);
                                resolve();
                            })
                        });
                    })


                } else {
                    resolve();
                }
            })
        })
    };


    CustomerDao.find({}, (err, customers) => {

        const upload = (index) => {
            if (index == customers.length) {
                console.log("finished");
                mongoose.disconnect();
            } else {
                let item = customers[index];
                console.log(`${index}/${customers.length}`);
                if (!item.customerPhone || item.customerPhone.length == 0) {
                    upload(index + 1);
                } else {
                    updateCustomerSame(item).then(() => {
                        upload(index + 1)
                    })
                }
            }
        };

        upload(0);


    })

});

const convertToTendigit = (number) => {
    const mapNumbers = {
        "0169" : "039",
        "0168" : "038",
        "0167" : "037",
        "0166" : "036",
        "0164" : "034",
        "0163" : "033",
        "0162" : "032",
        "0120" : "070",
        "0121" : "079",
        "0122" : "077",
        "0126" : "076",
        "0128" : "078",
        "0124" : "084",
        "0127" : "081",
        "0129" : "082",
        "0123" : "083",
        "0125" : "085",
        "0186" : "056",
        "0188" : "058",
        "0199" : "059",
    };

    const first4Letter = number.substr(0, 4);

    if (mapNumbers[first4Letter]) {
        return `${mapNumbers[first4Letter]}${number.substr(4)}`
    }

    return number;
};

gulp.task("update-customer-phone-number", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const CustomerDao = require("./dao/customer-dao");

    const updateCustomerPhoneNumber = (customer) => {
        return new Promise((resolve, reject)=>{
            CustomerDao.updateOne({_id: customer._id}, {customerPhone: convertToTendigit(customer.customerPhone)}, () => {
                resolve();
            })
        })
    };


    CustomerDao.find({}, (err, customers) => {

        const upload = (index) => {
            if (index == customers.length) {
                console.log("finished");
                mongoose.disconnect();
            } else {
                let item = customers[index];
                console.log(`${index}/${customers.length}`);
                if (!item.customerPhone || item.customerPhone.length == 0) {
                    upload(index + 1);
                } else {
                    updateCustomerPhoneNumber(item).then(() => {
                        upload(index + 1)
                    })
                }
            }
        };

        upload(0);


    })

});

gulp.task("update-customer-receiver-phone", () => {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", {useNewUrlParser: true});
    const BillDao = require("./dao/bill-dao");

    const updateCustomerPhoneNumber = (bill) => {
        return new Promise((resolve, reject)=>{
            if (bill.to.receiverPhone && bill.to.receiverPhone.length >= 10) {
                BillDao.updateOne({_id: bill._id}, {"to.receiverPhone": convertToTendigit(bill.to.receiverPhone)}, () => {
                    resolve();
                })
            }  else {
                resolve();
            }

        })
    };


    BillDao.find({}, (err, customers) => {

        const upload = (index) => {
            if (index == customers.length) {
                console.log("finished");
                mongoose.disconnect();
            } else {
                let item = customers[index];
                console.log(`${index}/${customers.length}`);
                updateCustomerPhoneNumber(item).then(() => {
                    upload(index + 1)
                })
            }
        };

        upload(0);
    })
});