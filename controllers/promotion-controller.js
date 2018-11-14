const PromotionDao = require("../dao/promotion-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/promotion",Security.authorDetails, function (req, res) {
        PromotionDao.create(req.body, function (err, product) {
            res.send(product);
        })
    });

    app.put("/promotion/:pid",Security.authorDetails, function (req, res) {
        delete req.body._id;
        PromotionDao.update({_id: req.params.pid}, req.body, function () {
            res.end();
        })
    });

    app.delete("/promotion/:pid",Security.authorDetails, function (req, res) {
        PromotionDao.remove({_id: req.params.pid}, function () {
            res.end();
        })
    });

    app.get("/promotion",Security.authorDetails, function (req, res) {
        PromotionDao.find({}, function (err, products) {
            res.send(products);
        })
    });
};

