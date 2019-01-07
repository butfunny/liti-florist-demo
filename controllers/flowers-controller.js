const FlowersDao = require("../dao/flowers-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/flowers", Security.authorDetails, (req, res) => {
        FlowersDao.findOne({productID: req.body.productID}, (err, flower) => {
            if (flower) res.send({error: true});
            else {
                FlowersDao.create(req.body, (err, flower) => {
                    res.json(flower)
                })
            }
        })
    });

    app.put("/flower/:id", Security.authorDetails, (req, res) => {
        delete req.body._id;
        FlowersDao.findOneAndUpdate({_id: req.parmas.id}, req.body, () => {
            res.end();
        })
    });

    app.post("/list-flowers", Security.authorDetails, (req, res) => {
        let {skip, keyword, sortKey, isDesc} = req.body;
        FlowersDao.find({name: new RegExp(".*" + keyword + ".*", "i")}).sort({[sortKey] : isDesc ? -1 : 1}).skip(skip).limit(15).exec((err, flowers) => {
            FlowersDao.countDocuments({name: new RegExp(".*" + keyword + ".*", "i")}, (err, count) => {
                res.json({
                    flowers,
                    total: count,
                })
            })
        })
    });


    app.delete("/flower/:id", Security.authorDetails, (req, res) => {
        FlowersDao.deleteOne({_id: req.params.id}, () => {
            res.end();
        })
    })
};