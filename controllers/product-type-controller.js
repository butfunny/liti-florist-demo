
const ProductTypeDao = require("../dao/product-type-dao");
const ProductColorDao = require("../dao/product-color-dao");
const Security = require("../security/security-be");
const SupplierDao = require("../dao/supplier-dao");


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


    app.post("/supplier",Security.isAdmin, function (req, res) {
        SupplierDao.findOne({name: req.body.name}, (err, type) => {
            if (!type) {
                SupplierDao.create(req.body, (err, supplier) => {
                    res.json(supplier);
                })
            } else {
                res.json({error: true});
            }
        });
    });

    app.get("/suppliers",Security.isAdmin, function (req, res) {
        SupplierDao.find({}, (err, types) => {
            res.json(types);
        })
    });


    app.delete("/supplier/:id", Security.isAdmin, (req, res) => {
        SupplierDao.deleteOne({name: req.params.id}, () => {
            res.end();
        })
    });

    app.put("/supplier/:id", Security.isAdmin, (req , res) => {
        delete req.body._id;
        SupplierDao.findOne({name: req.body.name}, (err, supplier) => {
            if (supplier && supplier._id != req.params.id) res.json({error: true});
            else {
                SupplierDao.findOneAndUpdate({_id: req.params.id}, {name: req.body.name}, (err) => {
                    res.end();
                })
            }
        })

    })


};

