
const ProductTypeDao = require("../dao/product-type-dao");
const ProductColorDao = require("../dao/product-color-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/product-type",Security.authorDetails, function (req, res) {
        ProductTypeDao.findOne({name: req.body.name}, (err, type) => {
            if (!type) {
                ProductTypeDao.create(req.body, () => {
                    res.end();
                })
            } else {
                res.end();
            }
        });
    });

    app.get("/product-type",Security.authorDetails, function (req, res) {
        ProductTypeDao.find({}, (err, types) => {
            res.json(types);
        })
    });

    app.put("/product-type", Security.authorDetails, (req, res) => {
        ProductTypeDao.deleteOne({name: req.body.name}, () => {
            res.end();
        })
    });


    app.post("/product-color",Security.authorDetails, function (req, res) {
        ProductColorDao.findOne({name: req.body.name}, (err, type) => {
            if (!type) {
                ProductColorDao.create(req.body, () => {
                    res.end();
                })
            } else {
                res.end();
            }
        });
    });

    app.get("/product-color",Security.authorDetails, function (req, res) {
        ProductColorDao.find({}, (err, types) => {
            res.json(types);
        })
    });


    app.put("/product-color", Security.authorDetails, (req, res) => {
        ProductColorDao.deleteOne({name: req.body.name}, () => {
            res.end();
        })
    });

};

