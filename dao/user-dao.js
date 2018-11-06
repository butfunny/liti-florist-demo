let mongoose = require('mongoose');

module.exports = mongoose.model('UserDao', {
    username: String,
    password: String,
    name: String,
    role: String
}, "users");
