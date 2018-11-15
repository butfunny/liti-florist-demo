const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const BillDraftDao = require("../dao/bill-draft");


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
            res.json(bill);
        })
    });

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
    // app.delete("/Bills/:bid",Security.authorDetails, function (req, res) {
    //     billDao.remove({_id: req.params.bid}, function () {
    //         starsCustomer.remove({bill_id: req.params.bid}, function () {
    //             res.end();
    //         })
    //     })
    // });
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