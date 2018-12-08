let mongoose = require('mongoose');

module.exports = mongoose.model('SubWareHouseDao', {
    itemID: String,
    warehouseID: String,
    quantity: Number
}, "subwarehouse");
