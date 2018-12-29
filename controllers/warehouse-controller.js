const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWareHouseDao = require("../dao/subwarehouse-dao");
const RequestWarehouseDao = require("../dao/request-warehouse-dao");
const RequestMissingDao = require("../dao/request-missing-dao");

module.exports = (app) => {
    app.post("/warehouse/create", Security.authorDetails, function (req, res) {
        WareHouseDao.findOne({productId: req.body.productId}, (err, found) => {
            if (found) {
                WareHouseDao.updateOne({productId: req.body.productId}, {quantity: found.quantity + req.body.quantity}, () => {
                    res.end()
                })
            } else {
                WareHouseDao.create(req.body, (err, item) => {
                    res.json(item)
                });
            }
        })

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
        SubWareHouseDao.find({warehouseID: req.params.id}, (err, subItems) => {
            WareHouseDao.find({_id: {$in: subItems.map(i => i.itemID)}}, (err, items) => {
                console.log(items);
                res.json({items, subItems});
            })
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
            SubWareHouseDao.find({itemID: {$in: request.items.map(i => i.itemID)}, warehouseID: request.fromWarehouse}, (err, subItems) => {

                let promises = [];
                const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
                    return new Promise((resolve, reject) =>{
                        WareHouseDao.findOne({_id: itemID}, (err, warehouseItem) => {
                            WareHouseDao.updateOne({_id: itemID}, {quantity: warehouseQty + warehouseItem.quantity}, () => {
                                SubWareHouseDao.updateOne({itemID: itemID, warehouseID}, {quantity: subWarehouseQty}, () => {
                                    resolve();
                                })
                            })
                        });

                    })
                };


                for (let requestItem of request.items) {
                    let itemFound = subItems.find(i => i.itemID == requestItem.itemID);
                    if (itemFound.quantity >= requestItem.quantity) {
                        promises.push(updateWarehouse(itemFound.itemID, requestItem.quantity, itemFound.quantity - requestItem.quantity, request.fromWarehouse))
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


    app.post("/request-missing-item", Security.authorDetails, (req, res) => {
        RequestMissingDao.create(req.body, (err, request) => {
            res.end();
        })
    });

    app.post("/request-missing-item-data", Security.authorDetails, (req, res) => {
        RequestMissingDao.find({created: {$gte: req.body.from, $lt: req.body.to}}, (err, requests) => {
            res.json(requests)
        })
    });

    app.post("/reject-missing-item/:id", Security.authorDetails, (req, res) => {
        RequestMissingDao.updateOne({_id: req.params.id}, {status: "Từ chối", reason: req.body.reason}, () => {
            res.end();
        })
    });

    app.post("/accept-missing-item/:id", Security.authorDetails, (req, res) => {
        RequestMissingDao.findOne({_id: req.params.id}, (err, request) => {
            SubWareHouseDao.find({itemID: {$in: request.items.map(i => i.itemID)}, warehouseID: request.warehouseID}, (err, subItems) => {
                let promises = [];
                const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
                    return new Promise((resolve, reject) =>{
                        SubWareHouseDao.updateOne({itemID: itemID, warehouseID}, {quantity: subWarehouseQty}, () => {
                            resolve();
                        })

                    })
                };


                for (let requestItem of request.items) {
                    let itemFound = subItems.find(i => i.itemID == requestItem.itemID);
                    if (itemFound.quantity >= requestItem.quantity) {
                        promises.push(updateWarehouse(itemFound.itemID, requestItem.quantity, itemFound.quantity - requestItem.quantity, request.warehouseID))
                    } else {
                        res.send({error: true});
                        return;
                    }
                }

                Promise.all(promises).then(() => {
                    RequestMissingDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
                        res.end();
                    });
                });

            })
        })

    })

};