const _ = require('lodash');
const Security = require("../security/security-be");
const BillDao = require("../dao/bill-dao");
const WareHouseDao = require("../dao/warehouse-dao");

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
        WareHouseDao.update({_id: {$in: req.body.ids}}, {billID: req.body.billID}, {multi: true}, (err) => {
            BillDao.findOneAndUpdate({_id: req.body.billID}, {status: req.body.status}, () => {
                res.end();
            })
        })
    })
};