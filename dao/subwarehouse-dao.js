let mongoose = require('mongoose');

module.exports = mongoose.model('SubWareHouseDao', {
    parentID: String,
    quantity: Number,
    supplierID: String,
    price: Number,
    oriPrice: Number,
    premisesID: String,
    baseProductID: String,
    created: Date,
    expireDate: Date
}, "sub-warehouse");
