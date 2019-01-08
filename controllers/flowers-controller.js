const FlowersDao = require("../dao/flowers-dao");
const WarehouseDao = require("../dao/warehouse-dao");
const SubWarehouseDao = require("../dao/subwarehouse-dao");
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
        FlowersDao.findOne({productID: req.body.productID}, (err, flower) => {
            if (flower && flower._id != req.params.id) res.send({error: true});
            else {
                FlowersDao.findOneAndUpdate({_id: req.params.id}, req.body, () => {
                    res.end();
                })
            }
        })


    });

    app.post("/list-flowers", Security.authorDetails, (req, res) => {
        let {skip, keyword, sortKey, isDesc, filteredColors, filteredTypes} = req.body;

        let query = [{name: new RegExp(".*" + keyword + ".*", "i")}];
        if (filteredColors.length > 0) {
            query.push({$or: filteredColors.map(color => ({colors: new RegExp(".*" + color + ".*", "i")}))})
        }

        if (filteredTypes.length > 0) {
            query.push({$or: filteredTypes.map(catalog => ({catalog: new RegExp(".*" + catalog + ".*", "i")}))})
        }

        FlowersDao.find({$and: query}).sort({[sortKey] : isDesc ? -1 : 1}).skip(skip).limit(15).exec((err, flowers) => {
            FlowersDao.countDocuments({$and: query}, (err, count) => {
                res.json({
                    flowers,
                    total: count,
                })
            })
        })
    });


    app.delete("/flower/:id", Security.authorDetails, (req, res) => {

        WarehouseDao.find({productID: req.params.pid}, (err, item) => {
            if (item) res.json({error: true});
            else {
                SubWarehouseDao.find({productID: req.params.pid}, (err, item) => {
                    if (item) res.json({error: true});
                    else {
                        FlowersDao.deleteOne({_id: req.params.id}, () => {
                            res.end();
                        })
                    }
                })
            }
        });


    })
};