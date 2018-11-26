const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");
const RequestWarehouseDao = require("../dao/request-warehouse-dao");

module.exports = (app) => {
    app.post("/warehouse/create", Security.authorDetails, function (req, res) {
        WareHouseDao.create(req.body, (err, items) => {
            res.json(items)
        });
    });

    app.get("/warehouse/list", Security.authorDetails, function (req, res) {
        WareHouseDao.find({billID: null}, (err, items) => {
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

    app.get("/warehouse/list-by-id/:id", Security.authorDetails, (req, res) => {
        WareHouseDao.find({warehouseID: req.params.id, billID: null}, (err, items) => {
            res.json(items);
        })
    });

    app.post("/request-warehouse/create", Security.authorDetails, function (req, res) {
        RequestWarehouseDao.create(req.body, (err, items) => {
            res.json(items);
        });
    });

    app.get("/request-warehouse/list", Security.authorDetails, function (req, res) {
        RequestWarehouseDao.find({}, (err, items) => {
            res.json(items)
        })
    });

    app.put("/request-warehouse/:id", Security.authorDetails, function (req, res) {
        delete req.body._id;
        RequestWarehouseDao.updateOne({_id: req.params.id}, req.body, () => {
            res.end();
        });
    });

    app.delete("/request-warehouse/:id", Security.authorDetails, function (req, res) {
        RequestWarehouseDao.remove({_id: req.params.id}, () => {
            res.end();
        });
    });




};