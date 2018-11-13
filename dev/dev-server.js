const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const server = require('http').Server(app);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/payment", { useNewUrlParser: true });

app.use(express.static(__dirname));
app.use("/api", bodyParser.json());

let router = express.Router();
app.use("/api", router);

require("../controllers/account-controller")(router);
require("../controllers/shop-controller")(router);
require("../controllers/product-controller")(router);
require("../controllers/customer-controller")(router);
require("../controllers/bill-controller")(router);
require("../controllers/vip-controller")(router);
require("../controllers/warehouse-controller")(router);

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at:${port}` );
});
