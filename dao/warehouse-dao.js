let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    parentID: String,
    quantity: Number,
    supplierID: String,
    price: Number,
    oriPrice: Number
}, "warehouse");
