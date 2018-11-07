
let mongoose = require('mongoose');

module.exports = mongoose.model('BillDao', {
    items:[{
        name: String,
        price: Number,
        quantity: Number,
        sale: Number,
        vat: Number
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
        shippingEmp: String,
        florist: String,
        saleEmp: String,
        shipMoney: String
    },
    base_id: String,
    vipSaleType: String,
    created: {type: Date, default: Date.now},
    created_by: String,
}, "bills");