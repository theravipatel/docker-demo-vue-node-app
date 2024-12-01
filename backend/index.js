// var express = require("express");
// var app = express();

// app.get("", (req, res) => {
//     res.send("This is Home Page!");
// });

// app.post("", (req, res) => {
//     res.send("This is Home Page!");
// });

// app.get("/about-us", (req, res) => {
//     res.send("This is About Us Page!");
// });

// app.get("/contact-us", (req, res) => {
//     res.send("This is Contact Us Page!");
// });

// //app.listen(5000);
// var server = app.listen(5000, () => {
//     var host = server.address().address;
//     var port = server.address().port;
    
//     console.log("App listening at http://%s:%s", host, port);
// });
require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const router = require("./routes/v1/adminRoutes");

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(cors({ origin: ['http://localhost:8080', 'http://127.0.0.1:8080']}));
app.use(express.json());

app.use("/api/v1", router);

var server = app.listen(5000, () => {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Example app listening at http://%s:%s", host, port);
 });