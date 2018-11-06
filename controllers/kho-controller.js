module.exports = function(injector) {
    injector
        .run(function(apiRouter, khoDao, Security) {
            apiRouter.get("/kho/items",Security.authorDetails, function (req, res) {
                khoDao.find({}, function (err, items) {
                    res.json(items);
                });
            });

            apiRouter.post("/kho/item",Security.authorDetails, function (req, res) {
               khoDao.create(req.body, function (err, item) {
                   res.json(item);
               })
            });

            apiRouter.put("/kho/item/:id", Security.authorDetails, function (req, res) {
                delete req.body._id;
                khoDao.update({_id: req.params.id}, req.body, function () {
                    res.end();
                })
            });

            apiRouter.delete("/kho/item/:id",Security.authorDetails, function (req, res) {
                khoDao.remove({_id: req.params.id}, function () {
                    res.end();
                })
            })
        })

    ;
};