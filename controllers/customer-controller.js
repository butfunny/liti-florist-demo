const _ = require('lodash');
const Security = require("../security/security-be");
const CustomerDao = require("../dao/customer-dao");
const BillDao = require("../dao/bill-dao");
const BillSupport = require("../common/common");

module.exports = (app) => {
    app.post("/customer", Security.authorDetails, function(req, res) {
        CustomerDao.create(req.body, function(err, customer) {
            res.json(customer._id);
        });
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
        let {skip, keyword} = req.body;
        CustomerDao.find({customerPhone: new RegExp(".*" + keyword + ".*")}).skip(skip).limit(50).exec((err, customers) => {
            CustomerDao.countDocuments({customerPhone: new RegExp(".*" + keyword + ".*")}, (err, count) => {
                BillDao.find({customerId: {$in: customers.map(c => c._id)}}, (err, bills) => {
                    res.json({
                        customers,
                        bills,
                        total: count
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
    })

};
