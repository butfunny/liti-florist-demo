let mongoose = require('mongoose');

module.exports = mongoose.model('FlowersDao', {
    productID: String,
    name: String,
    catalog: String,
    image: String,
    colors: [String],
    oriPrice: Number,
    price: Number,
    tags: [String],
    unit: String,
    lengthiness: Number
}, "flowers");

