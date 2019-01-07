const FlowersDao = require("../dao/flowers-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/flowers", Security.authorDetails, (req, res) => {
        FlowersDao.findOne({productID: req.body.productID}, (err, flower) => {
            if (flower) res.end({error: true});
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

    app.get("/flowers", Security.authorDetails, (req, res) => {
        console.log("Do later");
    });


    app.delete("/flower/:id", Security.authorDetails, (req, res) => {
        FlowersDao.deleteOne({_id: req.params.id}, () => {
            res.end();
        })
    })
};