const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const WareHouseDao = require("../dao/warehouse-dao");
const SubWarehouseDao = require("../dao/subwarehouse-dao");
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

        const updateSubWarehouse = (itemID, quantity) => {
            return new Promise((resolve, reject)=>{
                SubWarehouseDao.updateOne({itemID}, {quantity}, () => {
                    resolve();
                })
            })
        };

        let promises = [];

        SubWarehouseDao.find({itemID: {$in: req.body.selectedFlower.map(i => i.itemID)}, warehouseID: req.body.premises_id}, (err, items) => {
            for (let requestItem of req.body.selectedFlower) {
                let found = items.find(i => i.itemID == requestItem.itemID);
                if (requestItem.quantity > found.quantity) {
                    res.send({error: true});
                } else {
                    promises.push(updateSubWarehouse(requestItem.itemID, found.quantity - requestItem.quantity))
                }
            }
        });

        Promise.all(promises).then(() => {
            BillDao.findOneAndUpdate({_id: req.body.billID}, {status: req.body.status, selectedFlower: req.body.selectedFlower}, () => {
                res.end();
            });
        })
    });


    app.post("/ship/bills", Security.authorDetails, (req, res) => {
        BillDao.find({deliverTime: {$gte: req.body.from, $lt: req.body.to}, $or: [{status: "Done"}, {status: "Chờ giao"}]}, (err, bills) => {
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
                        text: `Đơn hàng ${bill.bill_number} của Anh (Chị) tại LITI FLORIST đã được giao thành công đến người nhận. Cảm ơn Anh (Chị) đã sử dụng sản phẩm dịch vụ của LITI FLORIST. L/H CSKH: ‎02435766338"`
                    })
                }
            });

            res.end();
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