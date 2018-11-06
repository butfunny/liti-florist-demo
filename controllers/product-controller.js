module.exports = function(injector) {
    injector
        .run(function(apiRouter, productDao, Security) {
            apiRouter.post("/product",Security.authorDetails, function (req, res) {
                productDao.create(req.body, function () {
                    res.end();
                })
            });

            apiRouter.put("/product/:pid",Security.authorDetails, function (req, res) {
                productDao.update({_id: req.params.pid}, {price: req.body.price, name: req.body.name}, function () {
                    res.end();
                })
            });

            apiRouter.delete("/product/:pid",Security.authorDetails, function (req, res) {
                productDao.remove({_id: req.params.pid}, function () {
                    res.end();
                })
            });

            apiRouter.get("/products",Security.authorDetails, function (req, res) {
                productDao.find({}, function (err, products) {
                    res.send(products);
                })
            });

            apiRouter.get("/products/:base_id",Security.authorDetails, function (req, res) {
                productDao.find({base_id: req.params.base_id}, function (err, products) {
                    res.send(products);
                })
            })

        })

    ;
};