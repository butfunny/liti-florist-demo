let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    productID: String,
    quantity: Number,
    supplierID: String,
    price: Number,
    oriPrice: Number
}, "warehouse");
