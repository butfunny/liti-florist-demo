var _ = require('lodash');

module.exports = function(injector) {
    injector
        .run(function(apiRouter, vipDao, customerDao, Security) {
            apiRouter.post("/vip/create", Security.authorDetails, function (req, res) {
                vipDao.findOne({ $or: [ { cardId: req.body.cardId }, { customerId: req.body.customerId } ] }, function (err, vip) {
                    if (vip != null) {
                        res.json({error: "Khách hàng đã là VIP hoặc thẻ đã được sử dụng"});
                    } else {
                        vipDao.create(req.body, function (err, created) {
                            res.json(created);
                        })
                    }
                });

            });

            apiRouter.get("/vip/customer/:cid", Security.authorDetails, function (req, res) {
                vipDao.findOne({customerId: req.params.cid}, function (err, vip) {
                    res.end(vip);
                })
            });

            apiRouter.get("/vip/card/:cid", Security.authorDetails, function (req, res) {
                vipDao.findOne({cardId: req.params.cid}, function (err, vip) {
                    if (vip == null) res.json({error: "Không tìm thấy khách hàng với mã thẻ này."});
                    else res.json(vip)
                })
            });

            apiRouter.get("/vip/list", Security.authorDetails, function (req, res) {
                vipDao.find({} , function (err, vips) {
                    var customerIDs = _.map(vips, "customerId");
                    customerDao.find({_id: {$in: customerIDs}}, function (err, customers) {
                        res.json({
                            vips: vips,
                            customers: customers
                        })
                    })
                })
            });

            apiRouter.delete("/vip/:id", Security.authorDetails, function (req, res) {
                vipDao.remove({_id: req.params.id}, function () {
                    res.end();
                })
            })
        })

    ;
};