const {getTotalBill} = require("../common/common");
const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWareHouseDao = require("../dao/subwarehouse-dao");
const SMSService = require("../service/sms-service");
const CustomerDao = require("../dao/customer-dao");

module.exports = (app) => {
    app.post("/florist/bills", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}}, (err, bills) => {
            res.json(bills.filter(bill => {
                if (bill.florists && bill.florists.length > 0) {
                    return bill.florists.find(f => f.user_id == req.user._id)
                }

                return false;
            }))
        })
    });

    app.post("/florist/submit-bill", Security.authorDetails, (req, res) => {

        SubWareHouseDao.find({_id: {$in: req.body.selectedFlower.map(i => i.id)}}, (err, items) => {
            let promises = [];
            for (let item of items) {
                let requestItem = req.body.selectedFlower.find(i => i.id == item._id);
                if (requestItem.quantity > item.quantity) {
                    res.json({error: "Kho không đủ số lượng."});
                    return;
                }
            }

            for (let item of items) {
                let requestItem = req.body.selectedFlower.find(i => i.id == item._id);
                const updateWarehouse = () => {
                    return new Promise((resolve, reject)=>{
                        SubWareHouseDao.findOne({_id: item._id}, (err, premisesItem) => {
                            SubWareHouseDao.updateOne({_id: premisesItem._id}, {quantity: premisesItem.quantity - requestItem.quantity}, () => {
                                resolve();
                            })
                        })
                    })
                };
                promises.push(updateWarehouse())
            }

            Promise.all(promises).then(() => {
                BillDao.findOneAndUpdate({_id: req.body.billID}, {status: req.body.status, selectedFlower: req.body.selectedFlower}, (err, bill) => {
                    BillDao.find({customerId: bill.customerId}, (err, bills) => {
                        let totalPay = _.sumBy(bills, b => getTotalBill(b));
                        CustomerDao.findOneAndUpdate({_id: bill.customerId}, {totalPay: totalPay, totalBill: bills.length}, () => {
                            res.end();
                        })
                    });

                });
            })
        })
    });


    app.post("/ship/bills", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, $or: [{status: "Done"}, {status: "Chờ Giao"}]}, (err, bills) => {
            res.json(bills.filter(bill => {
                if (bill.ships && bill.ships.length > 0) {
                    return bill.ships.find(f => f.user_id == req.user._id)
                }

                return false;
            }))
        })
    });

    app.post("/ship/done-bill", Security.authorDetails, (req, res) => {
        BillDao.findOneAndUpdate({_id: req.body.billID}, {status: "Done"}, (err, bill) => {
            CustomerDao.findOne({_id: bill.customerId}, (err, customer) => {
                if (customer) {
                    SMSService.sendMessage({
                        to: "84" + (customer.customerPhone.replace(/ /g, "")).substring(1),
                        text: `Đon hang ${bill.bill_number} cua Anh (Chi) tai LITI FLORIST da duoc giao thanh cong den nguoi nhan. Cam on Anh (Chi) da su dung san pham dich vu cua LITI FLORIST. L/H CSKH: ‎02435766338`
                    })
                }
            });

            BillDao.find({customerId: bill.customerId}, (err, bills) => {
                let totalPay = _.sumBy(bills, b => getTotalBill(b));
                CustomerDao.findOneAndUpdate({_id: bill.customerId}, {totalPay: totalPay, totalBill: bills.length}, () => {
                    res.end();
                })
            });

        })
    });

    app.post("/salary", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, status: "Done"}, (err, bills) => {
            res.json(bills.filter(bill => {
                if (bill.ships && bill.ships.length > 0) {
                    let found = bill.ships.find(f => f.user_id == req.user._id);
                    if (found) return true;
                }

                if (bill.florists && bill.florists.length > 0) {
                    let found = bill.florists.find(f => f.user_id == req.user._id);
                    if (found) return true;
                }

                if (bill.sales && bill.sales.length > 0) {
                    let found = bill.sales.find(f => f.user_id == req.user._id);
                    if (found) return true;
                }

                return false;
            }))
        })

    })
};