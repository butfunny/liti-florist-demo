const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const BillDraftDao = require("../dao/bill-draft");
const LogsDao = require("../dao/logs-dao");
const CustomerDao = require("../dao/customer-dao");
const VipDao = require("../dao/vip-dao");
const WareHouseDao = require("../dao/warehouse-dao");

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

    app.post("/bills-report/:base_id", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, base_id: req.params.base_id}, function(err, bills) {
            LogsDao.find({bill_id: {$in: bills.map(b => b._id)}}, function (err, logs) {
                CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                    res.json({bills, logs, customers});
                });
            });

        });
    });

    app.post("/bills-report-all", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}}, function(err, bills) {
            WareHouseDao.find({billID: {$in: bills.map(b => b.customerId)}}, (err, items) => {
                CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                    VipDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, vips) => {
                        res.json({bills, customers, vips, items});
                    });
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
        BillDao.updateOne({_id: req.params.bid}, {status: req.body.status, reason: req.body.reason}, (err) => {
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
    });

    app.get("/bill-draft-list/:pid", Security.authorDetails, (req, res) => {
        BillDraftDao.find({base_id: req.params.pid}, (err, bills) => {
            res.send(bills);
        })
    });


    app.get("/bill-draft/:bid", Security.authorDetails, (req, res) => {
        BillDraftDao.findOne({_id: req.params.bid}, (err, bill) => {
            CustomerDao.findOne({_id: bill.customerId}, (err, customer) => {
                res.json({bill, customer: customer ? customer : {}})
            });
        });
    });

    app.put("/bill-draft/:bid", Security.authorDetails, (req, res) => {
        delete req.body._id;
        BillDraftDao.updateOne({_id: req.params.bid}, req.body, () => {
            res.end();
        })
    });

    app.delete("/bill-draft/:bid", Security.authorDetails, (req, res) => {
        BillDraftDao.deleteOne({_id: req.params.bid}, () => {
            res.end();
        })
    });

    app.get("/bill-images", Security.authorDetails, (req, res) => {
        BillDao.find({image: {$exists: true}}, (err, bills) => {
            res.json(bills)
        })
    })

};