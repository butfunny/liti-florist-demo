let mongoose = require('mongoose');

module.exports = mongoose.model('PromotionDao', {
    name: String,
    dates: [Date],
    discount: Number
}, "promotion");
