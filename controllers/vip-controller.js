const _ = require('lodash');
const VipDao = require("../dao/vip-dao");
const Security = require("../security/security-be");
const CustomerDao = require("../dao/customer-dao");

module.exports = (app) => {
    app.post("/vip/create", Security.authorDetails, function (req, res) {
        VipDao.findOne({ $or: [ { cardId: req.body.cardId }, { customerId: req.body.customerId } ] }, function (err, vip) {
            if (vip != null) {
                res.json({error: "Khách hàng đã là VIP hoặc thẻ đã được sử dụng"});
            } else {
                VipDao.create({...req.body, createdBy: req.user}, function (err, created) {
                    res.json(created);
                })
            }
        });

    });

    app.get("/vip/customer/:cid", Security.authorDetails, function (req, res) {
        VipDao.findOne({customerId: req.params.cid}, function (err, vip) {
            res.json(vip);
        })
    });

    app.get("/vip/card/:cid", Security.authorDetails, function (req, res) {
        VipDao.findOne({cardId: req.params.cid}, function (err, vip) {
            if (vip == null) res.json({error: "Không tìm thấy khách hàng với mã thẻ này."});
            else {
                let today = new Date();
                today.setHours(0, 0, 0 ,0);
                let endDate = new Date(vip.endDate);
                endDate.setHours(0, 0, 0 ,0);
                if (today.getTime() > endDate.getTime()) {
                    res.json({error: "Thẻ hết hạn"})
                } else {
                    res.json(vip);
                }
            }
        })
    });

    app.get("/vip/list", Security.authorDetails, function (req, res) {
        VipDao.find({} , function (err, vips) {
            let customerIDs = _.map(vips, "customerId");
            CustomerDao.find({_id: {$in: customerIDs}}, function (err, customers) {
                res.json({
                    vips: vips,
                    customers: customers
                })
            })
        })
    });

    app.delete("/vip/:id", Security.authorDetails, function (req, res) {
        VipDao.remove({_id: req.params.id}, function () {
            res.end();
        })
    });

    app.put("/vip/:id", Security.authorDetails, (req, res) => {
        VipDao.findOneAndUpdate({_id: req.params.id}, req.body, (err) => {
            res.end();
        })
    })
};