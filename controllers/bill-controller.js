const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const BillDraftDao = require("../dao/bill-draft");
const LogsDao = require("../dao/logs-dao");
const CustomerDao = require("../dao/customer-dao");


module.exports = function(app) {
    app.post("/bill",Security.authorDetails, function(req, res) {

        let {payOwe, to, customerId} = req.body;

        BillDao.create(req.body, function(err, bill) {
            if (payOwe && to.paymentType != "Nợ") {
                BillDao.update({customerId: customerId}, {isOwe: false}, {multi: true}, function (err) {})
            }
            res.json(bill);
        });
    });

    app.post("/bill-draft", Security.authorDetails, function(req, res) {
        let {payOwe, to, customerId} = req.body;
        BillDraftDao.create(req.body, function(err, bill) {
            if (payOwe && to.paymentType != "Nợ") {
                BillDraftDao.update({customerId: customerId}, {isOwe: false}, {multi: true}, function (err) {})
            }
            res.json(bill);
        });
    });

    app.post("/bills-all", Security.authorDetails, function(req, res) {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false}, function(err, bills) {
            res.json(bills);
        });
    });

    app.get("/bill/:bid", Security.authorDetails, (req, res) => {
        BillDao.findOne({_id: req.params.bid}, (err, bill) => {
            CustomerDao.findOne({_id: bill.customerId}, (err, customer) => {
                res.json({bill, customer})
            });
        })
    });

    app.post("/bills/:base_id", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, base_id: req.params.base_id}, function(err, bills) {
            LogsDao.find({bill_id: {$in: bills.map(b => b._id)}}, function (err, logs) {
                CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                    res.json({bills, logs, customers});
                });
            });

        });
    });

    app.delete("/bill/:bid",Security.authorDetails, function (req, res) {
        BillDao.remove({_id: req.params.bid}, function () {
            res.end();
        })
    });

    app.put("/bill/update-image/:bid", Security.authorDetails, (req, res) => {
        BillDao.updateOne({_id: req.params.bid}, {image: req.body.file}, (err) => {
            res.end();
        })
    });

    app.put("/bill-update-status/:bid", Security.authorDetails, (req, res) => {
        BillDao.updateOne({_id: req.params.bid}, {status: req.body.status}, (err) => {
            res.end();
        })
    });

    app.put("/bill/:bid", Security.authorDetails, (req, res) => {
        delete req.body._id;
        BillDao.updateOne({_id: req.params.bid}, req.body, () => {
            LogsDao.create({
                bill_id: req.params.bid,
                user: {
                    username: req.user.username,
                    user_id: req.user._id
                },
                reason: req.body.reason,
                created: req.body.created
            }, () => {
                res.end();
            })
        })
    })


    // app.post("/Bills/getReports", Security.authorDetails, function(req, res) {
    //     billDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false, base_id: null}, function(err, bills) {
    //         res.json(bills);
    //     });
    // });
    //

    //
    // app.post("/Bills/getReports/:base_id",Security.authorDetails, function(req, res) {
    //     billDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false, base_id: req.params.base_id}, function(err, bills) {
    //         res.json(bills);
    //     });
    // });
    //
    //
    // app.put("/Bills/:bid",Security.authorDetails, function (req, res) {
    //     billDao.update({_id: req.params.bid}, req.body, function () {
    //         if (req.body.payOwe) {
    //             billDao.update({customerId: req.body.customerId}, {isOwe: false}, {multi: true}, function (err) {
    //                 res.end();
    //             })
    //         }
    //     })
    // });
    //
    // app.put("/Bills-update-time/:bid",Security.authorDetails, function (req, res) {
    //     billDao.update({_id: req.params.bid}, {deliverTime: req.body.deliverTime}, function () {
    //         res.end();
    //     })
    // });
    //
    // app.put("/Bills-update-base/:bid",Security.authorDetails, function (req, res) {
    //     billDao.update({_id: req.params.bid}, {base_id: req.body.base_id}, function () {
    //         res.end();
    //     })
    // });
    //
    //

    // app.get("/Bills/:bid",Security.authorDetails, function (req, res) {
    //     billDao.findOne({_id: req.params.bid}, function (err, bill) {
    //         res.send(bill);
    //     })
    // });
    //
    // app.put("/Bills-update/:bid",Security.authorDetails, function (req, res) {
    //     billDao.update({_id: req.params.bid}, {items: req.body.items, to: req.body.to, customerId: req.body.customerId, deliverTime: req.body.deliverTime, isOwe: req.body.isOwe, vipSaleType: req.body.vipSaleType}, function () {
    //         if (req.body.payOwe) {
    //             billDao.update({customerId: req.body.customerId}, {isOwe: false}, {multi: true}, function (err) {
    //                 res.end();
    //             })
    //         } else {
    //             res.end();
    //         }
    //     })
    // })

};