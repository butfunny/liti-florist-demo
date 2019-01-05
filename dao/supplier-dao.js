let mongoose = require('mongoose');

module.exports = mongoose.model('SupplierDao', {
    "name": String
}, "supplier");

