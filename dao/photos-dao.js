
let mongoose = require('mongoose');

module.exports = mongoose.model('PhotosDao', {
    url: String,
    colors: [String],
    flowerType: String,
    title: String,
    items: [JSON],
    price: Number
}, "photos");
