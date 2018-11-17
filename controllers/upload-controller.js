const Security = require("../security/security-be");
const multiparty = require("multiparty");
const fs = require("fs");
module.exports = (app) => {
    app.post("/upload", Security.authorDetails, (req, res) => {
        if (!req.user) {
            res.send({error: true})
        } else {
            let form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let currentTime = new Date().getTime();
                let {path: tempPath} = files.imageFile[0];
                const dir = __dirname + "/../upload";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                let copyToPath = dir + "/" + currentTime + ".png";
                console.log(dir);
                fs.readFile(tempPath, (err, data) => {
                    fs.writeFile(copyToPath, data, (err) => {
                        res.json({file: "/upload/" + currentTime + ".png"});
                    });
                });
            })
        }
    })
}