let mongoose = require('mongoose');

module.exports = mongoose.model('PromotionDao', {
    name: String,
    from: Date,
    to: Date,
    discount: Number
}, "promotion");
