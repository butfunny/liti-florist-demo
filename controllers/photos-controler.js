const PhotosDao = require("../dao/photos-dao");
const FlowersDao = require("../dao/flowers-dao");
const Security = require("../security/security-be");

module.exports = function(app) {
    app.post("/photos", Security.authorDetails, (req, res) => {
        PhotosDao.create(req.body, (err, photos) => {
            res.json(photos)
        })
    });

    app.get("/photos", Security.authorDetails, (req, res) => {
        PhotosDao.find({}, (err, photos) => {
            let flowerIDS = [];
            for (let photo of photos) {
                for (let item of photo.items) {
                    flowerIDS.push(item.parentID)
                }
            }

            FlowersDao.find({_id: {$in: flowerIDS}}, (err, flowers) => {
                res.json({
                    photos,
                    flowers
                })
            })
        })
    });

    app.put("/photos/:pid", Security.authorDetails, (req, res) => {
        PhotosDao.updateOne({_id: req.params.pid}, req.body, (err, photos) => {
            res.end()
        })
    });

    app.delete("/photos/:pid", Security.authorDetails, (req, res) => {
        PhotosDao.remove({_id: req.params.pid}, (err, photos) => {
            res.end();
        })
    })
};