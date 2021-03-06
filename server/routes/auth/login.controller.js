var express = require("express");
var router = express.Router();
var rest = require("../../middleware/rest");
var axios = require('axios');
var JSONAPIError = require('jsonapi-serializer').Error;
require("dotenv").config();


 
var authError = (message) => {
    return new JSONAPIError({
        status: 401,
        title: 'Invalid Authorization Parameters',
        detail: message
    });
};

var url = process.env.API;
console.log("url", url);
var authenticate = (username, password, req, res, next) => {
    return axios.post(`${url}/authenticate`, {
            'username': username,
            'password': password
        })
        .then(function(data) {
            req.session.user = JSON.parse(data.config.data);
            req.session.tokenApi = data.data.token
            next();

        }, function(err) {
            res.status(401).json(authError('Invalid username or password for user authentication.'));
        })
}

var login = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log("usernae", username, password);
    if (username && password) {
        var match = authenticate(username, password, req, res, next);
        // if (match) {
        //     req.session.user = match;
        //     next();
        // } else {
        //     res.status(401).json(authError('Invalid username or password for user authentication.'));
        // }
    } else {
        res.status(401).json(authError('Must provide username or password for user authentication.'));
    }
};

router.post('/login', login, (req, res, next) => {
    req.session.save((err) => {
        var user = req.session.user;
        var userJSON = user;
        userJSON.exp = new Date().getTime() + 600;
        // var jwt = res.jwt(userJSON);
        var jwt = res.jwt(user);
        res.json(jwt.token);
        // var user = req.session.user;
        // res.json(serializer.serialize(user));
    });
});

module.exports = router;