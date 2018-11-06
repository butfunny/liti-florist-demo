var request = require('request');
var nodemailer = require('nodemailer');
var config = require('../../config');
var _ = require('lodash');


var sendMail = function (customer) {
    var transporter = nodemailer.createTransport('smtps://'+ config.email + '%40gmail.com:' + config.password + '@smtp.gmail.com');

    var mailOptions = {
        to: 'danhsachkhachliti@gmail.com',
        subject: 'Khách Hàng Tích Đủ Sao',
        html: 'Khách Hàng <b>' + customer.customerName + "</b> đã tích đủ số sao quy định. <br> <b>Thông Tin Khách Hàng: </b> <br> <b>Tên: </b>" + customer.customerName + "<br>" + "<b>Số Điện thoại: </b>"
            + customer.receiverPhone + "<br> <b>Địa Chỉ: </b>" + customer.customerPlace
    };

    transporter.sendMail(mailOptions, function(error, info){
    })
}

module.exports = function(injector) {
    injector
        .run(function(apiRouter, billDao, starsCustomer, starConfig, customerDao, Security) {
            apiRouter.post("/Bills",Security.authorDetails, function(req, res) {
                billDao.create(req.body, function(err, bill) {
                    if (req.body.payOwe && req.body.to.paymentType != "Nợ") {
                        billDao.update({customerId: req.body.customerId}, {isOwe: false}, {multi: true}, function (err) {
                        })
                    }

                    starConfig.find({}, function (err, config) {
                        var total = 0;
                        for (var i = 0; i < req.body.items.length; i++) {
                            var item = req.body.items[i];
                            total += item.price * item.quantity
                        }

                        if (total >= config[0].money) {
                            starsCustomer.find({customer_id: req.body.customerId, active: true}, function (err, stars) {

                                var totalStar = _.sumBy(stars, function (s) {
                                    if (s.starNumb == undefined) return 1;
                                    return s.starNumb
                                });

                                var starInBill = Math.floor(total / config[0].money);
                                if (totalStar + starInBill >= config[0].number) {
                                    starsCustomer.update({ customer_id: req.body.customerId}, {$set: {active: false}}, {multi: true}, function () {
                                        starsCustomer.create({bill_id: bill._id, customer_id: req.body.customerId, active: true, starNumb: totalStar + starInBill - config[0].number}, function () {
                                            customerDao.findOne({_id: req.body.customerId}, function (err, customer) {
                                                sendMail(customer);
                                            })
                                        });
                                    });
                                } else {
                                    starsCustomer.create({
                                        bill_id: bill._id,
                                        customer_id: req.body.customerId,
                                        active: true,
                                        starNumb: starInBill}, function () {})
                                }
                            })
                        }
                    });


                    res.json(bill);
                });
            });
            apiRouter.post("/Bills/getReports", Security.authorDetails, function(req, res) {
                billDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false, base_id: null}, function(err, bills) {
                    res.json(bills);
                });
            });

            apiRouter.post("/Bills/getReportsAllBase", Security.authorDetails, function(req, res) {
                billDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false}, function(err, bills) {
                    res.json(bills);
                });
            });

            apiRouter.post("/Bills/getReports/:base_id",Security.authorDetails, function(req, res) {
                billDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, oldData: false, base_id: req.params.base_id}, function(err, bills) {
                    res.json(bills);
                });
            });


            apiRouter.put("/Bills/:bid",Security.authorDetails, function (req, res) {
                billDao.update({_id: req.params.bid}, req.body, function () {
                    if (req.body.payOwe) {
                        billDao.update({customerId: req.body.customerId}, {isOwe: false}, {multi: true}, function (err) {
                            res.end();
                        })
                    }
                })
            });

            apiRouter.put("/Bills-update-time/:bid",Security.authorDetails, function (req, res) {
                billDao.update({_id: req.params.bid}, {deliverTime: req.body.deliverTime}, function () {
                    res.end();
                })
            });

            apiRouter.put("/Bills-update-base/:bid",Security.authorDetails, function (req, res) {
                billDao.update({_id: req.params.bid}, {base_id: req.body.base_id}, function () {
                    res.end();
                })
            });


            apiRouter.delete("/Bills/:bid",Security.authorDetails, function (req, res) {
                billDao.remove({_id: req.params.bid}, function () {
                    starsCustomer.remove({bill_id: req.params.bid}, function () {
                        res.end();
                    })
                })
            });

            apiRouter.get("/Bills/:bid",Security.authorDetails, function (req, res) {
                billDao.findOne({_id: req.params.bid}, function (err, bill) {
                    res.send(bill);
                })
            });

            apiRouter.put("/Bills-update/:bid",Security.authorDetails, function (req, res) {
                billDao.update({_id: req.params.bid}, {items: req.body.items, to: req.body.to, customerId: req.body.customerId, deliverTime: req.body.deliverTime, isOwe: req.body.isOwe, vipSaleType: req.body.vipSaleType}, function () {
                    if (req.body.payOwe) {
                        billDao.update({customerId: req.body.customerId}, {isOwe: false}, {multi: true}, function (err) {
                            res.end();
                        })
                    } else {
                        res.end();
                    }
                })
            })

        })

    ;
};