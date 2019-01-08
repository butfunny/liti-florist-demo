let mongoose = require('mongoose');

module.exports = mongoose.model('SubWareHouseDao', {
    productID: String,
    quantity: Number,
    supplier: String,
    price: Number,
    oriPrice: Number,
    warehouseID: String
}, "sub-warehouse");
