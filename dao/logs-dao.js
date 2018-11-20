
let mongoose = require('mongoose');

module.exports = mongoose.model('LogsDao', {
    "bill_id": String,
    "sale_name": String,
    "sale": {
        name: String,
        user_id: String
    },
    "reason": String,
    created: Date,
    user: {
        username: String,
        user_id: String
    }
}, "logs");
