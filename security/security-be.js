const jwt = require('jsonwebtoken');
const UserDao = require("../dao/user-dao");

let createSecurityToken = (userData) => {

    return jwt.sign(userData.toJSON(), /* jwtSecret */ 'hoalili23fa3d4g1ea2r34iayg1345yg13', {
        expiresIn: "30 days"
    });
};

let verifyToken = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, /* jwtSecret */  'hoalili23fa3d4g1ea2r34iayg1345yg13', function (err, decodedAuth) {
            if (!decodedAuth) reject();
            else resolve(decodedAuth)
        });
    })
};

let decode = (req) => {
    return new Promise((resolve, reject) => {
        if (req.headers.authorization == null || req.headers.authorization.replace(/^Bearer /, '') == "null") {
            reject();
            return;
        }
        let token = req.headers.authorization.replace(/^Bearer /, '');
        verifyToken(token).then(_token => resolve(_token));
    })
};


module.exports = {
    authorDetails: (req, res, next) => {
        decode(req).then((decodedAuth) => {
                UserDao.findOne({_id: decodedAuth._id}, {"password": 0}, (err, user) => {
                    req.user = user;
                    next();
                })
            }, () => {
                res.status(401).end();
            }
        )
    },
    isAdmin: (req, res, next) => {
        decode(req).then((decodedAuth) => {
                UserDao.findOne({_id: decodedAuth._id}, {"password": 0}, (err, user) => {
                    if (user.isAdmin) {
                        req.user = user;
                        next();
                    } else {
                        res.status(401).end();
                    }
                })
            }, () => {
                res.status(401).end();
            }
        )
    },
    createSecurityToken
};




