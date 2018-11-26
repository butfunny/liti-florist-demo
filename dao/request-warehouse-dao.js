let mongoose = require('mongoose');

module.exports = mongoose.model('RequestWarehouseDao', {
    items: [String],
    toWarehouse: String,
    requestName: String,
    receivedName: String,
    requestType: String,
    created: Date
}, "request_warehouse");
