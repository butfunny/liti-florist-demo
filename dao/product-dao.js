let mongoose = require('mongoose');

module.exports = mongoose.model('ProductDao', {
    name: String,
    price: Number,
    base_id: String,
    flowerType: String,
    color: String
}, "products");
