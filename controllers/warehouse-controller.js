const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");

module.exports = (app) => {
    app.post("/warehouse/create", Security.authorDetails, function (req, res) {
        WareHouseDao.create(req.body, (err, items) => {
            res.json(items)
        });
    });

    app.get("/warehouse/list", Security.authorDetails, function (req, res) {
        WareHouseDao.find({}, (err, items) => {
            res.json(items)
        })
    });

    app.put("/warehouse/update", Security.authorDetails, function (req, res) {
        WareHouseDao.update({_id: {$in: req.body.ids}}, req.body.update, {multi: true}, () => {
            res.end();
        })
    });


    app.post("/warehouse/remove-multiple", Security.authorDetails, (req, res) => {
        WareHouseDao.remove({_id: {$in: req.body.ids}}, () => {
            res.end();
        })
    });
};