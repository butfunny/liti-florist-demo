
let mongoose = require('mongoose');

module.exports = mongoose.model('PhotosDao', {
    url: String,
    colors: [String],
    flowerType: String,
    note: String,
    title: String
}, "photos");
