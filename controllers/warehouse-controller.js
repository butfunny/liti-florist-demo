const _ = require('lodash');
const Security = require("../security/security-be");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWareHouseDao = require("../dao/subwarehouse-dao");
const RequestWarehouseDao = require("../dao/request-warehouse-dao");
const RequestMissingDao = require("../dao/request-missing-dao");
const FlowersDao = require("../dao/flowers-dao");
const BillDao = require("../dao/bill-dao");

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
                res.json({
                    flowersInWarehouse: []
                })
            }

            if (request.requestType == "return-to-supplier") {
                WareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
                    res.json({
                        flowersInWarehouse
                    })
                })
            }

            if (request.requestType == "transfer-to-subwarehouse") {

                if (request.fromWarehouse == "all") {
                    WareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
                        res.json({
                            flowersInWarehouse
                        })
                    })
                } else {
                    SubWareHouseDao.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
                        res.json({
                            flowersInWarehouse
                        })
                    })
                }

            }

            if (request.requestType == "return-to-base" || request.requestType == "report-missing" || request.requestType == "report-error") {

                let schema = SubWareHouseDao;
                if (request.premisesID == "all") {
                    schema = WareHouseDao
                }

                schema.find({_id: {$in: request.items.map(i => i.id)}}, (err, flowersInWarehouse) => {
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
                let promises = [];

                const createItem = (item) => {
                    return new Promise((resolve, reject)=>{
                        WareHouseDao.create({
                            importedQuantity : item.quantity,
                            supplierID: item.supplierID,
                            created: item.created,
                            expireDate: request.expireDate,
                            parentID: item.parentID,
                            oriPrice: item.oriPrice,
                            price: item.price,
                            quantity: item.quantity
                        }, (err, item) => {
                            resolve(item);
                        })
                    })
                };

                for (let item of request.items) {
                    promises.push(createItem(item))
                }

                Promise.all(promises).then((items) => {
                    if (request.toWarehouse != "all") {
                        for (let item of items) {
                            const updateWarehouse = () => {
                                return new Promise((resolve, reject)=>{
                                    let newSubWareHouseItem = {
                                        parentID: item.parentID,
                                        quantity: item.quantity,
                                        supplierID: item.supplierID,
                                        price: item.price,
                                        oriPrice: item.oriPrice,
                                        premisesID: request.toWarehouse,
                                        baseProductID: item._id,
                                        created: item.created,
                                        expireDate: item.expireDate
                                    };

                                    SubWareHouseDao.create(newSubWareHouseItem, () => {
                                        WareHouseDao.updateOne({_id: item._id}, {quantity: 0}, () => {
                                            resolve();
                                        })
                                    })
                                })

                            };
                            promises.push(updateWarehouse())
                        }

                        Promise.all(promises).then(() => {
                            RequestWarehouseDao.findOneAndUpdate({_id: request._id}, {status: "accepted"}, () => {
                                res.end();
                            })
                        })
                    } else {
                        RequestWarehouseDao.findOneAndUpdate({_id: request._id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    }
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

                        const updateItem = () => {
                            return new Promise((resolve, reject)=>{
                                WareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}, () => {
                                    resolve();
                                })
                            })
                        };

                        promises.push(updateItem())
                    }

                    Promise.all(promises).then(() => {
                        RequestWarehouseDao.updateOne({_id: req.params.id}, {status: "accepted"}, () => {
                            res.end();
                        })
                    })

                })
            }

            if (request.requestType == "transfer-to-subwarehouse") {
                if (request.fromWarehouse == "all") {
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
                                                baseProductID: item._id,
                                                created: item.created,
                                                expireDate: item.expireDate
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
                } else {
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
                                    SubWareHouseDao.findOne({baseProductID: item.baseProductID, premisesID: request.premisesID}, (err, premisesItem) => {
                                        if (premisesItem) {
                                            SubWareHouseDao.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity + requestItem.quantity}, () => {
                                                SubWareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}, () => {
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
                                                baseProductID: item.baseProductID,
                                                created: item.created,
                                                expireDate: item.expireDate
                                            };

                                            SubWareHouseDao.create(newSubWareHouseItem, () => {
                                                SubWareHouseDao.updateOne({_id: item._id}, {quantity: item.quantity - requestItem.quantity}, () => {
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

                let schema = SubWareHouseDao;

                if (request.premisesID == "all") {
                    schema = WareHouseDao
                }

                schema.find({_id: {$in: request.items.map(i => i.id)}}, (err, items) => {
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
                                schema.findOne({_id: item._id}, (err, premisesItem) => {
                                    schema.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity - requestItem.quantity}, () => {
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
        let {skip, keyword, sortKey, isDesc, filteredStatuses = [], filteredTypes = [], from, to, premisesID} = req.body;

        if (sortKey == null) sortKey = "created";
        if (isDesc == null) isDesc = true;


        let query = [
            {$or: [{receivedName: new RegExp(".*" + keyword + ".*", "i")}, {requestName: new RegExp(".*" + keyword + ".*", "i")}]}
        ];

        if (from) {
            query.push({created: {$gte: from, $lt: to}})
        }

        if (filteredStatuses.length > 0) {
            query.push({$or: filteredStatuses.map(status => ({status}))})
        }

        if (filteredTypes.length > 0) {
            query.push({$or: filteredTypes.map(type => ({requestType: type}))})
        }

        if (premisesID) {
            query.push({$or: [{toWarehouse: premisesID}, {premisesID}, {fromWarehouse: premisesID}]})
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

        FlowersDao.find({$or: [{name: new RegExp(".*" + keyword + ".*", "i")}, {productID: new RegExp(".*" + keyword + ".*", "i")}]}, (err, flowers) => {
            WareHouseDao.find({parentID: {$in: flowers.map(f => f._id)}}, (err, products) => {
                RequestWarehouseDao.find({status: "accepted"}, (err, requests) => {
                    BillDao.find({"selectedFlower.baseProductID": {$in : products.map(p => p._id)}}, (err, bills) => {
                        res.json({
                            products,
                            flowers,
                            requests,
                            bills
                        })
                    });


                });
            })
        });
    });

    app.post("/warehouse/sub-warehouse-items", Security.authorDetails, (req, res) => {
        let {keyword, premisesID} = req.body;

        let query = [{$or: [{name: new RegExp(".*" + keyword + ".*", "i")}, {productID: new RegExp(".*" + keyword + ".*", "i")}]}];

        FlowersDao.find({$and: query}, (err, flowers) => {
            SubWareHouseDao.find({$and: [{parentID: {$in: flowers.map(f => f._id)}}, {premisesID}]}, (err, products) => {
                RequestWarehouseDao.find({status: "accepted"}, (err, requests) => {
                    BillDao.find({"selectedFlower.id": {$in : products.map(p => p._id)}, premises_id: premisesID}, (err, bills) => {
                        res.json({
                            products,
                            flowers,
                            bills,
                            requests
                        })
                    });
                })



            })
        });
    });


    app.post("/warehouse/report-supplier", Security.authorDetails, (req, res) => {
        BillDao.find({$or: [{deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false}, {created: {$gte: req.body.from, $lt: req.body.to}, oldData: false}]}, (err, bills) => {
            res.json(bills)
        });
    });

    app.post("/warehouse/report-all-items", Security.authorDetails, (req, res) => {
        RequestWarehouseDao.find({}, (err, requests) => {
            FlowersDao.find({}, (err, flowers) => {
                res.json({requests, flowers})
            })
        })
    });

    app.put("/warehouse/update-price/:id", Security.authorDetails, (req, res) => {
        if (req.body.isSubWarehouse) {
            SubWareHouseDao.findOneAndUpdate({_id: req.params.id}, {price: req.body.price, oriPrice: req.body.oriPrice}, (err) => {
                res.end();
            })
        } else {
            WareHouseDao.findOneAndUpdate({_id: req.params.id}, {price: req.body.price, oriPrice: req.body.oriPrice}, (err) => {
                res.end();
            })
        }
    });

    app.post("/warehouse/request-list-by-date", Security.authorDetails, (req, res) => {
        let {filteredTypes = [], from, to} = req.body;

        let query = [];

        if (from) {
            query.push({created: {$gte: from, $lt: to}})
        }

        if (filteredTypes.length > 0) {
            query.push({$or: filteredTypes.map(type => ({requestType: type}))})
        }


        RequestWarehouseDao.find({$and: query}).exec((err, requests) => {
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

    app.get("/warehouse/export-excel", Security.authorDetails, (req, res) => {
        FlowersDao.find({}, (err, flowers) => {
            res.json(flowers);
        })
    })
};