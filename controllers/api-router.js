module.exports = function(injector) {
    injector
        .factory("apiRouter", function(httpApp) {

            var bodyParser = require('body-parser');
            httpApp.use("/api", bodyParser.json());
            httpApp.use(bodyParser.urlencoded({extended: true}));

            var router = require("express").Router();
            httpApp.use("/api", router);

            return router;
        })
    ;
};