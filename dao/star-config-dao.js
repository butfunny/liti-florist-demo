module.exports = function (injector) {
    var mongoose = require('mongoose');
    var schema = new mongoose.Schema({
        number: Number,
        money: Number
    });

    var urlDao = mongoose.model('star-config', schema);

    injector
        .value("starConfig", urlDao)
    ;
};