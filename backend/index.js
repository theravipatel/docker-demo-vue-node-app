var express = require("express");
var app = express();

app.get("", (req, res) => {
    res.send("This is Home Page!");
});

app.post("", (req, res) => {
    res.send("This is Home Page!");
});

app.get("/about-us", (req, res) => {
    res.send("This is About Us Page!");
});

app.get("/contact-us", (req, res) => {
    res.send("This is Contact Us Page!");
});

//app.listen(5000);
var server = app.listen(5000, () => {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("App listening at http://%s:%s", host, port);
});