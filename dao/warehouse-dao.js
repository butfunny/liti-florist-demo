let mongoose = require('mongoose');

module.exports = mongoose.model('WarehouseDao', {
    parentID: String,
    quantity: Number,
    supplierID: String,
    price: Number,
    oriPrice: Number,
    created: Date,
    expireDate: Date,
    importedQuantity: Number
}, "warehouse");
