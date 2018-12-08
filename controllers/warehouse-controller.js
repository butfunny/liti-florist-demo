const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWareHouseDao = require("../dao/subwarehouse-dao");
const RequestWarehouseDao = require("../dao/request-warehouse-dao");

module.exports = (app) => {
    app.post("/warehouse/create", Security.authorDetails, function (req, res) {
        WareHouseDao.create(req.body, (err, item) => {
            res.json(item)
        });
    });

    app.get("/warehouse/list", Security.authorDetails, function (req, res) {
        WareHouseDao.find({}, (err, items) => {
            SubWareHouseDao.find({}, (err, subItems) => {
                res.json({warehouseItems: items, subWarehouseItems: subItems});
            });
        })
    });

    app.put("/warehouse/:id", Security.authorDetails, function (req, res) {
        delete req.body._id;
        WareHouseDao.updateOne({_id: req.params.id}, req.body, () => {
            res.end();
        })
    });


    app.delete("/warehouse/:id", Security.authorDetails, (req, res) => {
        WareHouseDao.remove({_id: req.params.id}, (err) => {
            res.end()
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


    app.post("/reject-request/:id", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Từ chối", reason: req.body.reason}, () => {
            res.end();
        })
    });


    app.post("/accept-request/:id", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
            WareHouseDao.find({_id: {$in: request.items.map(i => i.itemID)}}, (err, items) => {
                let promises = [];

                const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
                    return new Promise((resolve, reject) =>{
                        WareHouseDao.updateOne({_id: itemID}, {quantity: warehouseQty}, () => {
                            SubWareHouseDao.findOne({itemID, warehouseID}, (err, found) => {
                                if (found) {
                                    SubWareHouseDao.updateOne({_id: found._id}, {quantity: found.quantity + subWarehouseQty}, () => {
                                        resolve();
                                    })
                                } else {
                                    SubWareHouseDao.create({itemID, quantity: subWarehouseQty, warehouseID}, (err, item) => {
                                        resolve();
                                    })
                                }
                            })
                        })
                    })
                };

                for (let requestItem of request.items) {
                    let itemFound = items.find(i => i._id == requestItem.itemID);
                    if (itemFound.quantity >= requestItem.quantity) {
                        promises.push(updateWarehouse(itemFound._id, itemFound.quantity - requestItem.quantity, requestItem.quantity, request.toWarehouse))
                    } else {
                        res.send({error: true});
                        return;
                    }
                }

                Promise.all(promises).then(() => {
                    RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
                        res.end();
                    });
                });

            })
        })
    });

    app.post("/accept-return/:id", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
            WareHouseDao.find({}, (err, items) => {
                let requestNames = items.filter(i => request.items.indexOf(i._id) > -1).map(i => i.name);
                let updatedIds = [];
                for (let name of requestNames) {
                    let found = items.find(i => i.name == name && i.warehouseID == request.fromWarehouse && updatedIds.indexOf(i._id) == -1);
                    if (found) {
                        updatedIds.push(found._id);
                    }
                }

                WareHouseDao.updateMany({_id: {$in: updatedIds}}, {warehouseID: null, warehouseName: null}, {multi: true}, (err) => {
                    RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
                        res.end();
                    });
                })

            })
        })
    })

};