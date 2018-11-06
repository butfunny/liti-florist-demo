var express = require("express");

module.exports = function(injector) {
    injector
        .run(function(httpApp) {
            httpApp.use("/img/icon.png", express.static("./public/img/hoa_icon.png"));
        })

    ;
};