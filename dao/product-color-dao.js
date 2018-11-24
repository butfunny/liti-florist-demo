let mongoose = require('mongoose');

module.exports = mongoose.model('ProductColorDao', {
    name: String,
}, "product_color");
