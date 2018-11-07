let mongoose = require('mongoose');

module.exports = mongoose.model('CustomerLocations', {
    customer_id: String,
    location: String
}, "customer_locations");

