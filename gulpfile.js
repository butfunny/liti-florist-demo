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

let packageAssets = function() {
    gulp.src(["./dev/**","!./dev/assets/js/**"])
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
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hoa-lyly", { useNewUrlParser: true });

    const UserDao = require("./dao/user-dao");
    const PremisesDao = require("./dao/premises-dao");

    UserDao.create({username: "cuongnguyen", isAdmin: true, password: crypto.createHash('md5').update("123123").digest("hex")}, (() => {
        PremisesDao.create({name: "3 Phố Huế", deleteable: false}, () => {
            mongoose.disconnect();
        })
    }))
});
