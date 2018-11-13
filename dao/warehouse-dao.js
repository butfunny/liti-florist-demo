let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    name: String,
    oriPrice: Number,
    price: Number,
    warehouseID: String,
    warehouseName: String,
    catalog: String
}, "warehouse");
