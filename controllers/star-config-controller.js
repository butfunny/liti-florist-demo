var _ = require('lodash');

module.exports = function(injector) {
    injector
        .run(function(apiRouter, starConfig, starsCustomer, Security) {
            apiRouter.get("/star-config", Security.authorDetails, function (req, res) {
                starConfig.find({}, function (err, config) {
                    res.json(config[0]);
                })
            });


            apiRouter.post("/star-config", Security.authorDetails, function (req, res) {
                var _id = req.body._id;
                if (_id) {
                    delete req.body._id;
                    starConfig.findOneAndUpdate({_id: _id}, {$set: req.body}, function (err) {
                        res.end();
                    })
                } else {
                    starConfig.create(req.body, function () {
                        res.end();
                    })
                }

            })

            apiRouter.get("/stars-customer/:cid", Security.authorDetails, function (req, res) {
                starsCustomer.find({customer_id: req.params.cid, active: true}, function (err, stars) {
                    var totalStar = _.sumBy(stars, function (s) {
                        if (s.starNumb == undefined) return 1;
                        return s.starNumb
                    });
                    res.json({totalStar: totalStar})
                })
            })
        })

    ;
};