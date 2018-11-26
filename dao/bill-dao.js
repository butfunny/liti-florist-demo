
let mongoose = require('mongoose');

module.exports = mongoose.model('BillDao', {
    items:[{
        name: String,
        price: Number,
        quantity: Number,
        sale: Number,
        vat: Number,
        flowerType: String,
        color: String
    }],
    vat: Number,
    deliverTime: Date,
    customerId : String,
    oldData: {type: Boolean, default: false},
    isOwe: Boolean,
    status: String,
    bill_number: String,
    to: {
        receiverPhone: String,
        receiverName: String,
        receiverPlace: String,
        cardContent: String,
        notes: String,
        paymentType: String,
        shipMoney: String,
    },
    sales: [{
        user_id: String,
        username: String,
        name: String
    }],
    florists: [{
        user_id: String,
        username: String,
        name: String
    }],
    ships: [{
        user_id: String,
        username: String,
        name: String
    }],
    base_id: Object,
    vipSaleType: String,
    created: {type: Date, default: Date.now},
    created_by: String,
    isNewCustomer: Boolean,
    promotion: {
        name: String,
        discount: Number,
        promotion_id: String
    },
    image: String,
    reason: String
}, "bills");