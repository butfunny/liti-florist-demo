var nodemailer = require('nodemailer');
var config = require('../../config');


module.exports = function(injector) {
    injector
        .run(function(apiRouter, logsDao, Security, billDao) {

            apiRouter.post("/logs/get", Security.authorDetails, function (req, res) {

                logsDao.find({bill_id: {$in: req.body}}, function (err, logs) {
                    res.json(logs);
                })
            })

            apiRouter.post("/logs", Security.authorDetails, function (req, res) {

                logsDao.create(req.body, function (err, log) {
                    billDao.findOne({_id: req.body.bill_id}, function (err, bill) {
                        var transporter = nodemailer.createTransport('smtps://'+ config.email + '%40gmail.com:' + config.password + '@smtp.gmail.com');

                        var mailOptions = {
                            to: 'ntvan1203@gmail.com',
                            subject: 'Cập Nhật Đơn Hàng',
                            html: 'Nhân viên <b>' + req.body.sale_name + "</b> đã cập nhật đơn hàng mã: <b>" + bill.bill_number + "</b> với nội dung là: <b>" + req.body.reason + "</b>"
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                        })
                    });
                    res.json(log);
                })
            })

        })

    ;
};