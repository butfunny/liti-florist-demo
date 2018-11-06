const ShopDao = require("../dao/shop-dao");
const Security = require("../security/security-be");

module.exports = (app) => {
    app.get("/shops", (req, res) => {
        ShopDao.find({}, (err, items) => {
            res.send(items);
        })
    });

    app.post("/shops", Security.isAdmin, (req, res) => {
        ShopDao.create(req.body, (err, items) => {
            res.send(items);
        })
    });

    app.put("/shops/:id", Security.isAdmin, (req, res) => {
        ShopDao.findOneAndUpdate({_id: req.params.id}, req.body, (err, items) => {
            res.send(items);
        })
    });

    app.delete("/shops/:id", Security.isAdmin, (req, res) => {
        ShopDao.findOne({_id: req.params.id}, (err, item) => {
            if (item.deleteable) {
                ShopDao.remove({_id: req.params.id}, (err) => {
                    res.end();
                })
            } else {
                res.status(500).end();
            }
        })
    })
};