let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    productID: String,
    quantity: Number,
    supplier: String,
    price: Number,
    oriPrice: Number
}, "warehouse");
