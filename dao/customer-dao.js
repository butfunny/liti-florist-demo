let mongoose = require('mongoose');

module.exports = mongoose.model('CustomerDao', {
    "customerName": String,
    "receiverName": String,
    "customerPlace": String,
    "receiverPlace": String,
    "customerPhone": String,
    "email": String,
    "receiverPhone": String,
    paymentType: String,
    birthDate: String,
    "gender": String,
    premises: [String],
    buyerFrom: [String],
    hobby: String,
    notes: String,
    totalPay: Number
}, "customers");

