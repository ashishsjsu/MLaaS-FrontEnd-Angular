var express = require('express');
var crypto = require("crypto");
var passport = require('passport');
var unirest = require('unirest');
var httpStatus = require('http-status-codes');

var mongoose = require('mongoose');
var UserSchema = mongoose.model('User');
var FileSchema = mongoose.model('Files');

var ensureAuthenticated = require('../modules/ensureAuthenticated');

var router = express.Router();

//every request returns a response
var response = function(message, status, res) {
    res.status(status).send(message);
};

// return todays date
var today = function(){
    var today = new Date();
    var date = today.getMonth() + "/" + today.getDate() + "/" + today.getYear() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date;
};

//check the login request body
var checkData = function(req, res, next) {
    console.log(req.body);
    next();
};

// test route
router.get('/index', function(req, res, next){
    res.render('app');
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* ===============================  Login/Registration =================================== */

router.get('/login', function(req, res){
  res.render('login');
});


router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            response({'user': req.user, 'isError': false}, httpStatus.OK, res);
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            var loggedInUser = {
                username: req.user.username,
                email: req.user.email,
                _id: req.user._id
            }
            return response({'data': loggedInUser, 'isError': false}, httpStatus.OK, res);
            return response({'data': loggedInUser, 'isError': false}, httpStatus.OK, res);
        });
    })(req, res, next);
});

//register a user
router.post('/register', function(req, res){

    var user = req.body;
    //create an md5 hash before storing the password
    var md5 = crypto.createHash('md5');
    md5 = md5.update(user.password).digest('hex');

    var User = {
        "email" : user.email,
        "username": user.username,
        "phone": user.phone,
        "password": md5
    }
        
    var userSchema = new UserSchema(User);

    userSchema.save(user, function(err, doc){
        if(err){
            console.log(err);
            res.json(err);
        }
        console.log("Saved: " + doc);
        res.json(doc);
    });

});

//get the basic info of currently logged in user
router.get('/user/sessionInfo', ensureAuthenticated, function(req, res){
    var info = {
        "username": req.session.passport.user.username,
        "email": req.session.passport.user.email
    }
    console.log({"user": info});
    res.json({"user": info});
});


//route for logout
router.get('/logout', function(req, res){

  req.logout();
  if (!req.user) 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.redirect('/login');
});


module.exports = router;