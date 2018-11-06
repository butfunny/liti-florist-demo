module.exports = function (injector) {
    var mongoose = require('mongoose');
    var schema = new mongoose.Schema({
        customer_id: String,
        bill_id: String,
        active: Boolean,
        starNumb: Number
    });

    var urlDao = mongoose.model('stars-customer', schema);

    injector
        .value("starsCustomer", urlDao)
    ;
};