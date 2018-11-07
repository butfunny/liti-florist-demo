
const ProductDao = require("../dao/product-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/product",Security.authorDetails, function (req, res) {
        ProductDao.create(req.body, function (err, product) {
            res.send(product);
        })
    });

    app.put("/product/:pid",Security.authorDetails, function (req, res) {
        ProductDao.update({_id: req.params.pid}, {price: req.body.price, name: req.body.name}, function () {
            res.end();
        })
    });

    app.delete("/product/:pid",Security.authorDetails, function (req, res) {
        ProductDao.remove({_id: req.params.pid}, function () {
            res.end();
        })
    });

    app.get("/products",Security.authorDetails, function (req, res) {
        ProductDao.find({}, function (err, products) {
            res.send(products);
        })
    });

    app.get("/products/:base_id",Security.authorDetails, function (req, res) {
        ProductDao.find({base_id: req.params.base_id}, function (err, products) {
            res.send(products ? products : []);
        })
    })
};

