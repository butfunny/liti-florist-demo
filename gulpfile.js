const gulp = require("gulp");
const nodemon = require('gulp-nodemon');
const spawn = require('child_process').spawn;
const run = require('gulp-run');
const fs = require('fs');
const fse = require('fs-extra');
const crypto = require("crypto");


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
            BillDao.update({base_id: baseID}, {base_id: id}, {multi: true}, (err) =>{
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