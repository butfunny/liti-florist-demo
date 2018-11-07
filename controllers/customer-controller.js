const _ = require('lodash');
const Security = require("../security/security-be");
const CustomerDao = require("../dao/customer-dao");
const CustomerLocations = require("../dao/customer-locations");
const BillDao = require("../dao/bill-dao");
const BillSupport = require("../common/common");

module.exports = (app) => {
    app.post("/customer", Security.authorDetails, function(req, res) {
        CustomerDao.create(req.body, function(err, customer) {
            res.json(customer._id);
        });
    });

    app.get("/find-customers-by-phone/:pn",Security.authorDetails, function (req, res) {
        CustomerDao.find({customerPhone: new RegExp(".*" + req.params.pn + ".*")} , function (err, users) {
            res.json({customers: users});
        });
    });

    app.get("/customer/:id", function (req, res) {
        CustomerDao.findOne({_id: req.params.id}, function (err, customer) {
            BillDao.find({customerId: req.params.id}, function (err, bills) {
                let totalSpend = 0;
                let totalOwe = 0;
                for (let bill of bills) {
                    if (bill.isOwe) {
                        totalOwe += BillSupport.getTotalBill(bill);
                    } else {
                        totalSpend += BillSupport.getTotalBill(bill);
                    }
                }

                res.json({customer, spend: {totalSpend, totalOwe}, locations: _.uniq(_.map(bills, b => b.to.receiverPlace))});
            })
        })
    });

    app.put("/customer/:id",Security.authorDetails, function(req, res) {
        CustomerDao.findOneAndUpdate({_id: req.params["id"]}, {$set: req.body}, function() {
            if (!req.body.location_id) {
                CustomerLocations.create({customer_id: req.params.id, location: req.body.location}, () => {
                    res.end();
                })
            } else {
                res.end();
            }
        });
    });


    // app.get("/Customers",Security.authorDetails, function(req, res) {
    //     customerDao.find(function(err, customers) {
    //         var customerIds = _.map(customers, "_id");
    //         billDao.find({customerId: {$in: customerIds}}, function (err, bills) {
    //             var customersSpend = [];
    //             for (var i = 0; i < customers.length; i++) {
    //                 var customer = customers[i];
    //                 var totalSpend = 0;
    //                 var totalOwe = 0;
    //                 for (var j = 0; j < bills.length; j++) {
    //                     var bill = bills[j];
    //                     if (customer._id == bill.customerId) {
    //                         for (var k = 0; k < bill.items.length; k++) {
    //                             var item = bill.items[k];
    //                             if (bill.isOwe) {
    //                                 var owe = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
    //                                 totalOwe += owe + (owe * (item.vat || 0))/100;
    //                             } else {
    //                                 var spend = item.quantity * item.price - (item.quantity * item.price * (item.sale || 0))/100;
    //                                 totalSpend += spend + (spend * (item.vat || 0))/100;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 var customerSpend = {
    //                     _id: customer._id,
    //                     totalSpend: totalSpend,
    //                     totalOwe: totalOwe
    //                 };
    //                 customersSpend.push(customerSpend);
    //             }
    //             res.json({customers: customers, totalSpend: customersSpend});
    //
    //         });
    //     });
    // });




    app.post("/Customers/select",Security.authorDetails, function (req, res) {
        customerDao.find({_id: {$in: req.body}}, function (err, customers) {
            res.json(customers);
        })
    });

    app.get("/Customer-Last-Address/:cid", function (req, res) {
        billDao.find({customerId: req.params.cid}, null, {sort: '-created'}, function (err, bills) {
            res.json(bills[0]);
        })
    });




    app.get("/customer-total-pay/:cid", Security.authorDetails, function (req, res) {
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
}
