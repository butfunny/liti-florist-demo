const UserDao = require("../dao/user-dao");
const Security = require("../security/security-be");
const PermissionDao = require("../dao/permission-dao");
const crypto = require("crypto");
const _ = require("lodash");

module.exports = (app) => {
    app.get("/me", Security.authorDetails, (req, res) => {
        res.send(req.user);
    });

    app.post("/login", (req, res) => {
        if (_.isEmpty(req.body)) {
            res.status(400).end();
            return;
        }

        let {username, password} = req.body;

        UserDao.findOne({username, password: crypto.createHash('md5').update(password).digest("hex")}, {"password": 0}, (err, user) => {
            if (user == null) {
                res.status(401).end();
            } else {
                res.json({
                    user: user,
                    token: Security.createSecurityToken(user)
                })
            }
        })
    });

    app.post("/me/change-password", Security.authorDetails, (req, res) => {
        UserDao.findOne({_id: req.user._id, password: crypto.createHash('md5').update(req.body.oldPassword).digest("hex")
        }, (err, user) => {
            if (user == null) {
                res.json({error: "Wrong Password"})
            } else {
                UserDao.update({_id: req.user._id}, {password: crypto.createHash('md5').update(req.body.newPassword).digest("hex")}, function () {
                    res.end();
                })
            }
        })
    });

    app.get("/manage/users", Security.isAdmin, (req, res) => {
        UserDao.find({}, {password: 0}, (err, users) => {
            res.json(users);
        })
    });

    app.post("/manage/user", Security.isAdmin, (req, res) => {
        UserDao.findOne({username: req.body.username}, (err, user) => {
            if (user) res.json({error: "Tên tài khoản đã tồn tại"});
            else {
                UserDao.create({...req.body, password: crypto.createHash('md5').update(req.body.password).digest("hex") }, (err, user) => {
                    res.json(user);
                })
            }
        });

    });

    app.put("/manage/user/:id", Security.isAdmin, (req, res) => {
        UserDao.findOneAndUpdate({_id: req.params.id}, req.body, (err, updated) => {
            res.json(updated);
        })
    });

    app.delete("/manage/user/:id", Security.isAdmin, (req, res) => {
        UserDao.remove({_id: req.params.id}, () => {
            res.end()
        })
    });

    app.get("/get-sales-florist-account", Security.authorDetails, (req, res) => {
        UserDao.find({$or: [{role: "sale"}, {role: "florist"}, {role: "ship"}]}, (err, users) => {
            res.send(users)
        })
    });


    app.post("/permission", Security.isAdmin, (req, res) => {
        PermissionDao.find({}, (err, permission) => {
            if (permission.length == 0) {
                PermissionDao.create({permission: JSON.stringify(req.body)}, (err) => {
                    res.end()
                })
            } else {
                PermissionDao.updateOne({_id: permission[0]._id}, {permission: JSON.stringify(req.body)}, (err) => {
                    res.end();
                })
            }
        })
    });

    app.get("/permission", Security.authorDetails, (req, res) => {
        PermissionDao.find({}, (err, permission) => {
            if (permission.length == 0) {
                res.json(null)
            } else {
                res.json(JSON.parse(permission[0].permission));
            }
        })
    })

};