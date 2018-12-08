let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    name: String,
    oriPrice: Number,
    price: Number,
    catalog: String,
    productId: String,
    unit: String,
    quantity: Number
}, "warehouse");
