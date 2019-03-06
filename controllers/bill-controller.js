const {getTotalBill} = require("../common/common");
const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const BillDraftDao = require("../dao/bill-draft");
const LogsDao = require("../dao/logs-dao");
const CustomerDao = require("../dao/customer-dao");
const VipDao = require("../dao/vip-dao");
const WareHouseDao = require("../dao/warehouse-dao");
const FlowesrDao = require("../dao/flowers-dao");
const nodemailer = require("nodemailer");
const SMSService = require("../service/sms-service");

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
            CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                res.json({bills, customers})
            });
        });
    });

    app.get("/bill/:bid", Security.authorDetails, (req, res) => {
        BillDao.findOne({_id: req.params.bid}, (err, bill) => {
            CustomerDao.findOne({_id: bill.customerId}, (err, customer) => {
                res.json({bill, customer})
            });
        })
    });

    app.post("/bills-report/:premises_id", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, premises_id: req.params.premises_id}, function(err, bills) {
            LogsDao.find({bill_id: {$in: bills.map(b => b._id)}}, function (err, logs) {
                CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                    res.json({bills, logs, customers});
                });
            });

        });
    });

    app.post("/bills-report-all", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}}, function(err, bills) {
            CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                VipDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, vips) => {
                    res.json({bills, customers, vips});
                });
            });
        });
    });

    app.delete("/bill/:bid",Security.authorDetails, function (req, res) {
        BillDao.findOne({_id: req.params.bid}, (err, bill) => {
            BillDao.remove({_id: req.params.bid}, function () {
                BillDao.find({customerId: bill.customerId}, (err, bills) => {
                    let totalPay = _.sumBy(bills, b => getTotalBill(b));
                    CustomerDao.findOneAndUpdate({_id: bill.customerId}, {totalPay: totalPay, totalBill: bills.length}, () => {
                        res.end();
                    })
                })
            })
        });

    });

    app.put("/bill/update-image/:bid", Security.authorDetails, (req, res) => {
        BillDao.updateOne({_id: req.params.bid}, {image: req.body.file}, (err) => {
            res.end();
        })
    });

    app.put("/bill-update-status/:bid", Security.authorDetails, (req, res) => {
        BillDao.findOneAndUpdate({_id: req.params.bid}, {status: req.body.status}, (err, bill) => {

            if (req.body.status == "Done") {
                CustomerDao.findOne({_id: bill.customerId}, (err, customer) => {
                    if (customer) {
                        SMSService.sendMessage({
                            to: "84" + (customer.customerPhone.replace(/ /g, "")).substring(1),
                            text: `Đon hang ${bill.bill_number} cua Anh/Chi tai LITI FLORIST da duoc giao thanh cong den nguoi nhan. Cam on A/C da su dung san pham dich vu cua LITI FLORIST. L/H CSKH: 02435766338`
                        })
                    }
                });
            }

            BillDao.find({customerId: bill.customerId}, (err, bills) => {
                let totalPay = _.sumBy(bills, b => getTotalBill(b));
                CustomerDao.findOneAndUpdate({_id: bill.customerId}, {totalPay: totalPay, totalBill: bills.length}, () => {
                    res.end();
                })
            });
        })
    });

    app.put("/bill-move-premises/:bid", Security.authorDetails, (req, res) => {
        BillDao.updateOne({_id: req.params.bid}, {premises_id: req.body.premises_id}, (err) => {
            res.end();
        })
    });

    app.put("/bill/:bid", Security.authorDetails, (req, res) => {
        delete req.body._id;
        BillDao.updateOne({_id: req.params.bid}, req.body, () => {
            var transporter = nodemailer.createTransport('smtps://litiflorist.dev%40gmail.com:manhcuong94@smtp.gmail.com');

            var mailOptions = {
                to: 'sales@hoaliti.com',
                subject: 'Cập Nhật Đơn Hàng',
                html: 'Nhân viên <b>' + req.user.username + "</b> đã cập nhật đơn hàng mã: <b>" + req.body.bill_number + "</b> với nội dung là: <b>" + req.body.reason + "</b>"
            };

            let {payOwe, customerId} = req.body;
            if (payOwe) {
                BillDao.update({customerId: customerId}, {isOwe: false}, {multi: true}, function (err) {})
            }


            transporter.sendMail(mailOptions, function(error, info){});

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
        BillDraftDao.find({premises_id: req.params.pid}, (err, bills) => {
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
            const flowers = bills.map(b => b.selectedFlower);
            let ret = [];
            for (let flower of flowers) {
                for (let item of flower) {
                    ret.push(item.parentID);
                }
            }

            FlowesrDao.find({_id: {$in: ret}}, (err, flowers) => {
                res.json({
                    bills,
                    flowers
                })
            });

        })
    });

    app.post("/bills-report-excel", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, premises_id: {$in: req.body.selectedPremises}}, function(err, bills) {
            CustomerDao.find({_id: {$in: bills.map(b => b.customerId)}}, (err, customers) => {
                res.json({bills, customers});
            });

        });
    });


    app.post("/bill-number", Security.authorDetails, function(req, res) {
        BillDao.find({created: {$gte: req.body.from, $lt: req.body.to}, oldData: false}, function(err, bills) {
            res.json({bills});
        });
    })

};