const LogsDao = require("../dao/logs-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/logs/get", Security.authorDetails, function (req, res) {
        LogsDao.find({bill_id: {$in: req.body}}, function (err, logs) {
            res.json(logs);
        })
    });

    app.post("/logs", Security.authorDetails, function (req, res) {
        LogsDao.create(req.body, function (err, log) {
            res.json(log);
        })
    })
};