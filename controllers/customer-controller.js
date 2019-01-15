const _ = require('lodash');
const Security = require("../security/security-be");
const CustomerDao = require("../dao/customer-dao");
const BillDao = require("../dao/bill-dao");
const VipDao = require("../dao/vip-dao");
const BillSupport = require("../common/common");
const SMSService = require("../service/sms-service");
const {getTotalBill} = require("../common/common");

module.exports = (app) => {
    app.post("/customer", Security.authorDetails, function(req, res) {
        if (req.body.customerPhone.length > 0) {
            CustomerDao.findOne({customerPhone: req.body.customerPhone}, (err, customer) => {
                if (customer) {
                    res.json(customer);
                } else {
                    CustomerDao.create(req.body, function(err, customer) {
                        SMSService.sendMessage({
                            to: "84" + (customer.customerPhone.replace(/ /g, "")).substring(1),
                            text: "Cam on QK da trai nghiem san pham dich vu cua LITI FLORIST. Hi vong QK hai long voi san pham dich vu cua chung toi. Moi gop y vui long LH CSKH:02435766338"
                        });

                        res.json(customer);
                    });
                }
            })
        } else {
            CustomerDao.create(req.body, function(err, customer) {
                res.json(customer);
            });
        }


    });

    app.get("/find-customers-by-phone/:pn",Security.authorDetails, function (req, res) {
        CustomerDao.find({customerPhone: new RegExp(".*" + req.params.pn + ".*")}).limit(10).exec(function (err, users) {
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

                res.json({customer, spend: {totalSpend, totalOwe}, locations: bills.map(b => b.to)});
            })
        })
    });

    app.put("/customer/:id",Security.authorDetails, function(req, res) {
        CustomerDao.findOneAndUpdate({_id: req.params["id"]}, {$set: req.body}, function() {
            res.end();
        });
    });

    app.post("/customers", (req, res) => {
        let {skip, keyword, sortKey, isDesc} = req.body;
        CustomerDao.find({$or: [{customerPhone: new RegExp(".*" + keyword + ".*")}, {customerName: new RegExp(".*" + keyword + ".*")}]}).sort({[sortKey] : isDesc ? -1 : 1}).skip(skip).limit(15).exec((err, customers) => {
            CustomerDao.countDocuments({$or: [{customerPhone: new RegExp(".*" + keyword + ".*")}, {customerName: new RegExp(".*" + keyword + ".*")}]}, (err, count) => {
                BillDao.find({customerId: {$in: customers.map(c => c._id)}}, (err, bills) => {
                    VipDao.find({customerId: {$in: customers.map(c => c._id)}}, (err, vips) => {
                        res.json({
                            customers,
                            bills,
                            total: count,
                            vips
                        })
                    })


                })
            })
        })
    });

    app.get("/customers-birthday", (req, res) => {
        CustomerDao.find({}, (err, customers) => {
            let ret = [];
            for (let customer of customers) {
                if (customer.birthDate) {
                    let dobMonth = new Date(customer.birthDate).getMonth();
                    if (dobMonth == new Date().getMonth()) {
                        ret.push(customer);
                    }
                }
            }

            res.json(ret);

        })
    });

    app.put("/update-customer-pay/:id", Security.authorDetails, (req, res) => {
        BillDao.find({customerId: req.params.id}, (err, bills) => {
            let totalPay = _.sumBy(bills, b => getTotalBill(b));
            CustomerDao.findOneAndUpdate({_id: req.params.id}, {totalPay: totalPay, totalBill: bills.length}, () => {
                res.end();
            })
        })
    });

    app.get("/get-customers", Security.authorDetails, (req, res) => {
        CustomerDao.find({}, (err, customers) => {
            res.json(customers);
        })
    })

};
