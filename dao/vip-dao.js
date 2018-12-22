let mongoose = require('mongoose');

module.exports = mongoose.model('VipDao', {
    "customerId": String,
    "cardId": String,
    birthDate: Date,
    created: {type: Date, default: Date.now},
    vipType: String,
    createdBy: {
        username: String,
        name: String
    },
    endDate: Date,
}, "vips");
