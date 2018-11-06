module.exports = function(injector) {
    injector
        .run(function(apiRouter, billDraftDao, Security) {
            apiRouter.post("/BillDraft",Security.authorDetails, function (req , res) {
                billDraftDao.create(req.body, function (err, billDraft) {
                    res.json(billDraft);
                })
            });

            apiRouter.get("/BillDraft",Security.authorDetails, function (req, res) {
                billDraftDao.find({base_id: {"$exists" : false}}, function (err, billDrafts) {
                    res.json(billDrafts);
                })
            });

            apiRouter.get("/BillDraft/:base_id",Security.authorDetails, function (req, res) {
                billDraftDao.find({base_id: req.params.base_id}, function (err, billDrafts) {
                    res.json(billDrafts);
                })
            });

            apiRouter.delete("/BillDraft/:id",Security.authorDetails, function (req, res) {
                billDraftDao.remove({_id: req.params.id}, function (err) {
                    res.end();
                })
            });

            apiRouter.get("/BillDraft/:id", Security.authorDetails,function (req, res) {
                billDraftDao.findOne({_id: req.params.id}, function (err, billDraft) {
                    res.json(billDraft);
                })
            });

            apiRouter.put("/BillDraft/:id", Security.authorDetails, function (req, res) {
                billDraftDao.update({_id: req.params.id}, {$set: req.body}, function (err) {
                    res.end();
                })
            })


        })

    ;
};