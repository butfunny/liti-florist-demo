let mongoose = require('mongoose');

module.exports = mongoose.model('RequestMissingDao', {
    items: [JSON],
    warehouseID: String,
    requestName: String,
    receivedName: String,
    created: Date,
    status: String,
    reason: String,
    type: String
}, "request_missing");
