let mongoose = require('mongoose');

module.exports = mongoose.model('ShopDao', {
    "base_id": Number,
    "name": String,
    "address": String,
}, "shop");

