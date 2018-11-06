var _ = require('lodash');

module.exports = function(injector) {
    injector
        .run(function(apiRouter, customerDao, billDao, Security) {
            apiRouter.post("/Customers", Security.authorDetails, function(req, res) {
                customerDao.create(req.body, function(err, customer) {
                    res.json(customer._id);
                });
            });
            apiRouter.get("/Customers",Security.authorDetails, function(req, res) {
                customerDao.find(function(err, customers) {
                    var customerIds = _.map(customers, "_id");
                    billDao.find({customerId: {$in: customerIds}}, function (err, bills) {
                        var customersSpend = [];
                        for (var i = 0; i < customers.length; i++) {
                            var customer = customers[i];
                            var totalSpend = 0;
                            var totalOwe = 0;
                            for (var j = 0; j < bills.length; j++) {
                                var bill = bills[j];
                                if (customer._id == bill.customerId) {
                                    for (var k = 0; k < bill.items.length; k++) {
                                        var item = bill.items[k];
                                        if (bill.isOwe) {
                                            var owe = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
                                            totalOwe += owe + (owe * (item.vat || 0))/100;
                                        } else {
                                            var spend = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
                                            totalSpend += spend + (spend * (item.vat || 0))/100;
                                        }
                                    }
                                }
                            }
                            var customerSpend = {
                                _id: customer._id,
                                totalSpend: totalSpend,
                                totalOwe: totalOwe
                            };
                            customersSpend.push(customerSpend);
                        }
                        res.json({customers: customers, totalSpend: customersSpend});

                    });
                });
            });
            apiRouter.put("/Customer/:customerId",Security.authorDetails, function(req, res) {
                customerDao.findOneAndUpdate({_id: req.params["customerId"]}, {$set: req.body}, function() {});
                res.end();
            });

            apiRouter.get("/Customers/:customerId",Security.authorDetails, function (req, res) {
                customerDao.findOne({_id: req.params["customerId"]}, function (err, customer) {
                    billDao.find({customerId: req.params["customerId"]}, function (err, bills) {
                        var totalSpend = 0;
                        var totalOwe = 0;
                        for (var j = 0; j < bills.length; j++) {
                            var bill = bills[j];
                            for (var k = 0; k < bill.items.length; k++) {
                                var item = bill.items[k];

                                var price = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
                                price = price + (price * (item.vat || 0))/10;

                                if (bill.isOwe) {
                                    totalOwe += price;
                                } else {
                                    totalSpend += price;
                                }
                            }
                        }
                        var customerSpend = {
                            totalSpend: totalSpend,
                            totalOwe: totalOwe
                        };
                        res.json({customer: customer, totalSpend: customerSpend});
                    });
                })
            });

            apiRouter.post("/Customers/select",Security.authorDetails, function (req, res) {
                customerDao.find({_id: {$in: req.body}}, function (err, customers) {
                    res.json(customers);
                })
            });

            apiRouter.get("/Customer-Last-Address/:cid", function (req, res) {
                billDao.find({customerId: req.params.cid}, null, {sort: '-created'}, function (err, bills) {
                    res.json(bills[0]);
                })
            });


            apiRouter.get("/Customers-By-Phone/:pn",Security.authorDetails, function (req, res) {
                var phoneNumber = req.params.pn;
                customerDao.find({customerPhone: new RegExp(".*" + phoneNumber + ".*")} , function (err, users) {
                    res.json({customers: users});
                })
            });


            apiRouter.get("/customer-total-pay/:cid", Security.authorDetails, function (req, res) {
                billDao.find({customerId: req.params.cid}, function (err, bills) {
                    var totalSpend = 0;
                    var totalOwe = 0;
                    for (var j = 0; j < bills.length; j++) {
                        var bill = bills[j];
                        for (var k = 0; k < bill.items.length; k++) {
                            var item = bill.items[k];

                            var price = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
                            price = price + (price * (item.vat || 0))/10;

                            if (bill.isOwe) {
                                totalOwe += price;
                            } else {
                                totalSpend += price;
                            }
                        }
                    }

                    res.json({totalSpend: totalSpend, totalOwe: totalOwe});
                });
            })
        })

    ;
};