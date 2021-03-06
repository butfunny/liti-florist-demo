
let mongoose = require('mongoose');

module.exports = mongoose.model('BillDao', {
    items:[{
        name: String,
        price: Number,
        quantity: Number,
        sale: Number,
        vat: Number,
        flowerType: String,
        color: String,
        size: String
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
        buyerFrom: String,
        mcc: String,
        distance: {type: Number, default: 0}
    },
    sales: [{
        user_id: String,
        username: String,
        name: String,
        isOnl: {type: Boolean, default: false}
    }],
    florists: [{
        user_id: String,
        username: String,
        name: String
    }],
    ships: [{
        user_id: String,
        username: String,
        name: String,
        shipType: Number
    }],
    base_id: Number,
    premises_id: String,
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
    reason: String,
    selectedFlower: [{
        baseProductID: String,
        oriPrice: String,
        id: String,
        parentID: String,
        price: Number,
        quantity: Number,
        supplierID: String
    }],
    surcharge: {type : Number, default: 0},
    surchargeMember: [{
        user_id: String,
        username: String,
        name: String
    }]
}, "bills");