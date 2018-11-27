let mongoose = require('mongoose');

module.exports = mongoose.model('RequestWarehouseDao', {
    items: [String],
    toWarehouse: String,
    requestName: String,
    receivedName: String,
    created: Date,
    status: String,
    reason: String
}, "request_warehouse");
