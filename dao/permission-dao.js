
let mongoose = require('mongoose');

module.exports = mongoose.model('PermissionDao', {
    permission: String
}, "permission");
