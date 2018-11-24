let mongoose = require('mongoose');

module.exports = mongoose.model('ProductTypeDao', {
    name: String,
}, "product_type_dao");
