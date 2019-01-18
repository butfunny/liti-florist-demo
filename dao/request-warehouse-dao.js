let mongoose = require('mongoose');

module.exports = mongoose.model('RequestWarehouseDao', {
    items: [{
        supplierID: String,
        created: Date,
        parentID: String,
        oriPrice: Number,
        price: Number,
        quantity: Number,
        id: String
    }],
    toWarehouse: String,
    fromWarehouse: String,
    requestName: String,
    receivedName: String,
    created: Date,
    status: String,
    reason: String,
    requestType: String,
    supplierID: String,
    premisesID: String,
    expireDate: Date
}, "request_warehouse");
