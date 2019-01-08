let mongoose = require('mongoose');

module.exports = mongoose.model('RequestWarehouseDao', {
    items: [JSON],
    toWarehouse: String,
    fromWarehouse: String,
    requestName: String,
    receivedName: String,
    created: Date,
    status: String,
    reason: String,
    requestType: String,
    supplierID: String
}, "request_warehouse");
