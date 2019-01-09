const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWareHouseDao = require("../dao/subwarehouse-dao");
const RequestWarehouseDao = require("../dao/request-warehouse-dao");
const RequestMissingDao = require("../dao/request-missing-dao");
const FlowersDao = require("../dao/flowers-dao");

module.exports = (app) => {


    app.post("/warehouse/create-request", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.create(req.body, (err, request) => {
            res.json(request);
        });
    });


    app.put("/warehouse/update-request/:id", Security.authorDetails, (req, res) => {
        delete req.body._id;
        RequestWarehouseDao.findOneAndUpdate({_id: req.params.id}, req.body, (err, request) => {
            res.json(request);
        })
    });

    app.get("/warehouse/detail-request/:id", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
            if (request.requestType == "request-from-supplier") {
                WareHouseDao.find({parentID: {$in: request.items.map(i => i.parentID)}}, (err, flowersInWarehouse) => {
                    res.json({
                        flowersInWarehouse
                    })
                })
            }

            if (request.requestType == "return-to-supplier" || request.requestType == "transfer-to-subwarehouse") {
                WareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
                    res.json({
                        flowersInWarehouse
                    })
                })
            }

            if (request.requestType == "return-to-base" || request.requestType == "report-missing" || request.requestType == "report-error") {
                SubWareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
                    res.json({
                        flowersInWarehouse
                    })
                })
            }
        })
    });

    app.post("/warehouse/accept-request/:id", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
            if (request.requestType == "request-from-supplier") {
                WareHouseDao.find({parentID: {$in: request.items.map(i => i.parentID)}}, (err, flowersInWarehouse) => {
                    let promises = [];

                    for (let item of request.items) {
                        let found = flowersInWarehouse.find(i => i.parentID == item.parentID && i.price == item.price && i.oriPrice == item.oriPrice && i.supplierID == item.supplierID);
                        if (found) {
                            promises.push(WareHouseDao.updateOne({_id: found._id}, {quantity: found.quantity + item.quantity}))
                        } else {
                            promises.push(WareHouseDao.create(item))
                        }
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })

                })
            }

            if (request.requestType == "return-to-supplier") {
                WareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, items) => {
                    let promises = [];

                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        if (requestItem.quantity > item.quantity) {
                            res.json({error: "Kho không đủ số lượng trả."});
                            return;
                        }
                    }

                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        promises.push(WareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}))
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })

                })
            }

            if (request.requestType == "transfer-to-subwarehouse") {
                WareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, items) => {
                    let promises = [];
                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        if (requestItem.quantity > item.quantity) {
                            res.json({error: "Kho không đủ số lượng chuyển."});
                            return;
                        }
                    }

                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        const updateWarehouse = () => {
                            return new Promise((resolve, reject)=>{
                                SubWareHouseDao.findOne({baseProductID: item._id, premisesID: request.premisesID}, (err, premisesItem) => {
                                    if (premisesItem) {
                                        SubWareHouseDao.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity + requestItem.quantity}, () => {
                                            WareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}, () => {
                                                resolve();
                                            })
                                        })
                                    } else {
                                        let newSubWareHouseItem = {
                                            parentID: item.parentID,
                                            quantity: requestItem.quantity,
                                            supplierID: item.supplierID,
                                            price: item.price,
                                            oriPrice: item.oriPrice,
                                            premisesID: request.premisesID,
                                            baseProductID: item._id
                                        };

                                        SubWareHouseDao.create(newSubWareHouseItem, () => {
                                            WareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}, () => {
                                                resolve();
                                            })
                                        })
                                    }
                                })
                            })
                        };
                        promises.push(updateWarehouse())
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })
                })
            }

            if (request.requestType == "return-to-base") {
                SubWareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, items) => {
                    let promises = [];
                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        if (requestItem.quantity > item.quantity) {
                            res.json({error: "Kho không đủ số lượng chuyển."});
                            return;
                        }
                    }

                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        const updateWarehouse = () => {
                            return new Promise((resolve, reject)=>{
                                SubWareHouseDao.findOne({_id: item._id}, (err, premisesItem) => {
                                    SubWareHouseDao.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity - requestItem.quantity}, () => {
                                        WareHouseDao.findOne({_id: premisesItem.baseProductID}, (err, baseItem) => {
                                            WareHouseDao.updateOne({_id: premisesItem.baseProductID}, {quantity: baseItem.quantity + requestItem.quantity}, () => {
                                                resolve();
                                            })
                                        });
                                    })
                                })
                            })
                        };
                        promises.push(updateWarehouse())
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })
                })
            }

            if (request.requestType == "report-missing" || request.requestType == "report-error") {
                SubWareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, items) => {
                    let promises = [];
                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        if (requestItem.quantity > item.quantity) {
                            res.json({error: "Kho không đủ số lượng."});
                            return;
                        }
                    }

                    for (let item of items) {
                        let requestItem = request.items.find(i => i.id == item._id);
                        const updateWarehouse = () => {
                            return new Promise((resolve, reject)=>{
                                SubWareHouseDao.findOne({_id: item._id}, (err, premisesItem) => {
                                    SubWareHouseDao.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity - requestItem.quantity}, () => {
                                        resolve();
                                    })
                                })
                            })
                        };
                        promises.push(updateWarehouse())
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })
                })
            }


        })

    });


    app.post("/warehouse/request-list", Security.authorDetails, (req, res) => {
        let {skip, keyword, sortKey, isDesc, filteredStatuses = [], filteredTypes = []} = req.body;

        if (sortKey == null) sortKey = "created";
        if (isDesc == null) isDesc = true;

        let query = [
            {$or: [{receivedName: new RegExp(".*" + keyword + ".*", "i")}, {requestName: new RegExp(".*" + keyword + ".*", "i")}]}
        ];

        if (filteredStatuses.length > 0) {
            query.push({$or: filteredStatuses.map(status => ({status}))})
        }

        if (filteredTypes.length > 0) {
            query.push({$or: filteredTypes.map(type => ({requestType: type}))})
        }

        RequestWarehouseDao.find({$and: query}).sort({[sortKey] : isDesc ? -1 : 1}).skip(skip).limit(15).exec((err, requests) => {
            RequestWarehouseDao.countDocuments({$and: query}, (err, count) => {
                let flowerIds = [];
                for (let request of requests) {
                    flowerIds = flowerIds.concat(request.items.map(i => i.parentID))
                }

                FlowersDao.find({_id: {$in: flowerIds}}, (err, flowers) => {
                    res.json({
                        requests,
                        flowers,
                        total: count,
                    })
                })


            })
        })
    });


    app.post("/warehouse/base-items", Security.authorDetails, (req, res) => {
        let {keyword} = req.body;

        let query = [{$or: [{name: new RegExp(".*" + keyword + ".*", "i")}, {productID: new RegExp(".*" + keyword + ".*", "i")}]}];

        FlowersDao.find({$and: query}, (err, flowers) => {
            WareHouseDao.find({parentID: {$in: flowers.map(f => f._id)}}, (err, products) => {
                res.json({
                    products,
                    flowers
                })
            })
        });
    });

    app.post("/warehouse/sub-warehouse-items", Security.authorDetails, (req, res) => {
        let {keyword, premisesID} = req.body;

        let query = [{$or: [{name: new RegExp(".*" + keyword + ".*", "i")}, {productID: new RegExp(".*" + keyword + ".*", "i")}]}];

        FlowersDao.find({$and: query}, (err, flowers) => {
            SubWareHouseDao.find({$and: [{parentID: {$in: flowers.map(f => f._id)}}, {premisesID}]}, (err, products) => {
                res.json({
                    products,
                    flowers
                })
            })
        });
    });





    // app.post("/warehouse/create", Security.authorDetails, function (req, res) {
    //     WareHouseDao.findOne({productId: req.body.productId}, (err, found) => {
    //         if (found) {
    //             WareHouseDao.updateOne({productId: req.body.productId}, {quantity: found.quantity + req.body.quantity}, () => {
    //                 res.end()
    //             })
    //         } else {
    //             WareHouseDao.create(req.body, (err, item) => {
    //                 res.json(item)
    //             });
    //         }
    //     })
    //
    // });
    //
    // app.get("/warehouse/list", Security.authorDetails, function (req, res) {
    //     WareHouseDao.find({}, (err, items) => {
    //         SubWareHouseDao.find({}, (err, subItems) => {
    //             res.json({warehouseItems: items, subWarehouseItems: subItems});
    //         });
    //     })
    // });
    //
    // app.put("/warehouse/:id", Security.authorDetails, function (req, res) {
    //     delete req.body._id;
    //     WareHouseDao.updateOne({_id: req.params.id}, req.body, () => {
    //         res.end();
    //     })
    // });
    //
    //
    // app.delete("/warehouse/:id", Security.authorDetails, (req, res) => {
    //     WareHouseDao.remove({_id: req.params.id}, (err) => {
    //         res.end()
    //     })
    // });
    //
    //
    //
    // app.post("/warehouse/remove-multiple", Security.authorDetails, (req, res) => {
    //     WareHouseDao.remove({_id: {$in: req.body.ids}}, () => {
    //         res.end();
    //     })
    // });
    //
    // app.get("/warehouse/list-by-id/:id", Security.authorDetails, (req, res) => {
    //     SubWareHouseDao.find({warehouseID: req.params.id}, (err, subItems) => {
    //         WareHouseDao.find({_id: {$in: subItems.map(i => i.itemID)}}, (err, items) => {
    //             res.json({items, subItems});
    //         })
    //     })
    // });
    //
    // app.post("/request-warehouse/create", Security.authorDetails, function (req, res) {
    //     RequestWarehouseDao.create(req.body, (err, items) => {
    //         res.json(items);
    //     });
    // });
    //
    // app.get("/request-warehouse/list", Security.authorDetails, function (req, res) {
    //     RequestWarehouseDao.find({}, (err, items) => {
    //         res.json(items)
    //     })
    // });
    //
    // app.put("/request-warehouse/:id", Security.authorDetails, function (req, res) {
    //     delete req.body._id;
    //     RequestWarehouseDao.updateOne({_id: req.params.id}, req.body, () => {
    //         res.end();
    //     });
    // });
    //
    // app.delete("/request-warehouse/:id", Security.authorDetails, function (req, res) {
    //     RequestWarehouseDao.remove({_id: req.params.id}, () => {
    //         res.end();
    //     });
    // });
    //
    //
    // app.post("/reject-request/:id", Security.authorDetails, (req, res) => {
    //     RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Từ chối", reason: req.body.reason}, () => {
    //         res.end();
    //     })
    // });
    //
    //
    // app.post("/accept-request/:id", Security.authorDetails, (req, res) => {
    //     RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
    //         WareHouseDao.find({_id: {$in: request.items.map(i => i.itemID)}}, (err, items) => {
    //             let promises = [];
    //
    //             const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
    //                 return new Promise((resolve, reject) =>{
    //                     WareHouseDao.updateOne({_id: itemID}, {quantity: warehouseQty}, () => {
    //                         SubWareHouseDao.findOne({itemID, warehouseID}, (err, found) => {
    //                             if (found) {
    //                                 SubWareHouseDao.updateOne({_id: found._id}, {quantity: found.quantity + subWarehouseQty}, () => {
    //                                     resolve();
    //                                 })
    //                             } else {
    //                                 SubWareHouseDao.create({itemID, quantity: subWarehouseQty, warehouseID}, (err, item) => {
    //                                     resolve();
    //                                 })
    //                             }
    //                         })
    //                     })
    //                 })
    //             };
    //
    //             for (let requestItem of request.items) {
    //                 let itemFound = items.find(i => i._id == requestItem.itemID);
    //                 if (itemFound.quantity >= requestItem.quantity) {
    //                     promises.push(updateWarehouse(itemFound._id, itemFound.quantity - requestItem.quantity, requestItem.quantity, request.toWarehouse))
    //                 } else {
    //                     res.send({error: true});
    //                     return;
    //                 }
    //             }
    //
    //             Promise.all(promises).then(() => {
    //                 RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
    //                     res.end();
    //                 });
    //             });
    //
    //         })
    //     })
    // });
    //
    // app.post("/accept-return/:id", Security.authorDetails, (req, res) => {
    //     RequestWarehouseDao.findOne({_id: req.params.id}, (err, request) => {
    //         SubWareHouseDao.find({itemID: {$in: request.items.map(i => i.itemID)}, warehouseID: request.fromWarehouse}, (err, subItems) => {
    //
    //             let promises = [];
    //             const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
    //                 return new Promise((resolve, reject) =>{
    //                     WareHouseDao.findOne({_id: itemID}, (err, warehouseItem) => {
    //                         WareHouseDao.updateOne({_id: itemID}, {quantity: warehouseQty + warehouseItem.quantity}, () => {
    //                             SubWareHouseDao.updateOne({itemID: itemID, warehouseID}, {quantity: subWarehouseQty}, () => {
    //                                 resolve();
    //                             })
    //                         })
    //                     });
    //
    //                 })
    //             };
    //
    //
    //             for (let requestItem of request.items) {
    //                 let itemFound = subItems.find(i => i.itemID == requestItem.itemID);
    //                 if (itemFound.quantity >= requestItem.quantity) {
    //                     promises.push(updateWarehouse(itemFound.itemID, requestItem.quantity, itemFound.quantity - requestItem.quantity, request.fromWarehouse))
    //                 } else {
    //                     res.send({error: true});
    //                     return;
    //                 }
    //             }
    //
    //             Promise.all(promises).then(() => {
    //                 RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
    //                     res.end();
    //                 });
    //             });
    //
    //         })
    //     })
    // });
    //
    //
    // app.post("/request-missing-item", Security.authorDetails, (req, res) => {
    //     RequestMissingDao.create(req.body, (err, request) => {
    //         res.end();
    //     })
    // });
    //
    // app.post("/request-missing-item-data", Security.authorDetails, (req, res) => {
    //     RequestMissingDao.find({created: {$gte: req.body.from, $lt: req.body.to}}, (err, requests) => {
    //         res.json(requests)
    //     })
    // });
    //
    // app.post("/reject-missing-item/:id", Security.authorDetails, (req, res) => {
    //     RequestMissingDao.updateOne({_id: req.params.id}, {status: "Từ chối", reason: req.body.reason}, () => {
    //         res.end();
    //     })
    // });
    //
    // app.post("/accept-missing-item/:id", Security.authorDetails, (req, res) => {
    //     RequestMissingDao.findOne({_id: req.params.id}, (err, request) => {
    //         SubWareHouseDao.find({itemID: {$in: request.items.map(i => i.itemID)}, warehouseID: request.warehouseID}, (err, subItems) => {
    //             let promises = [];
    //             const updateWarehouse = (itemID, warehouseQty, subWarehouseQty, warehouseID) => {
    //                 return new Promise((resolve, reject) =>{
    //                     SubWareHouseDao.updateOne({itemID: itemID, warehouseID}, {quantity: subWarehouseQty}, () => {
    //                         resolve();
    //                     })
    //
    //                 })
    //             };
    //
    //
    //             for (let requestItem of request.items) {
    //                 let itemFound = subItems.find(i => i.itemID == requestItem.itemID);
    //                 if (itemFound.quantity >= requestItem.quantity) {
    //                     promises.push(updateWarehouse(itemFound.itemID, requestItem.quantity, itemFound.quantity - requestItem.quantity, request.warehouseID))
    //                 } else {
    //                     res.send({error: true});
    //                     return;
    //                 }
    //             }
    //
    //             Promise.all(promises).then(() => {
    //                 RequestMissingDao.updateOne({_id: req.params.id}, {status: "Xác nhận"}, () => {
    //                     res.end();
    //                 });
    //             });
    //
    //         })
    //     })
    //
    // })

};