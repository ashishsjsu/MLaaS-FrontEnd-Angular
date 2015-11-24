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

/* ===============================  Files I/O =================================== */


router.post('/files', function(req, res, next){

    var file = req.body;
    console.log(req.body);

    var columns = JSON.parse(req.body.columns);

    var update = {'$pushAll': { 'columns': columns }};
    var query = {'username': req.body.username, 'filename': req.body.filename}

    var file = {
        'username': req.body.username,
        'filename': req.body.filename,
        'date': req.body.date
    }
    var files = new FileSchema(file);

    files.save(files, function(err, doc){
        
        if(err){
            console.log(err);
            res.json(err);
        }
        console.log("Saved: " + doc);
        
        if(doc !== null || doc !== undefined){

            FileSchema.update(query, update, function(err, numAffected){
                if(err){
                    console.log(err);
                    res.json({'msg': "Update failed!"});
                }
                console.log(numAffected);
                res.json({'msg': numAffected + " records updated"});

            });
        }
    });
});


router.get('/files/:username', function(req, res, next){

    FileSchema.find({'username': req.params.username}, function(err, data){
        if(err){
            res.json({'message': err});
        }
        if(data !== null){
            console.log(data);
            res.json({'message': data});
        }
    }); 
});

/* ================================ Tasks list for a user ================================ */

router.get('/tasks/:username', function(req, res, next){

    UserSchema.find({'username': req.params.username}, function(err, data) { 
        if(err) {
            console.log("Error in db");
            res.json({'message': err});
        }
        if(data !== null){
            //console.log(data[0].tasks);
            res.json({'message': data[0].tasks});
        }
    });
});


/* ================================ Get statistics form raw file =========================*/

// this API creates a data statistics job and updates the task metadata in user's profile, the task metadata is received from the Python flask server
//ensure user is authenticated to use this API
router.get('/files/:filename/statistics', ensureAuthenticated, function(req, res, next){

    unirest.post('http://localhost:5000/statistics/'+req.params.filename)
    .header('Accept', 'application/json')
    //.send({'msg': 'hello there!'})
    .end(function(response){
        // return a json response with task status url, task id, task name
        var responsedata = {
            'taskname': 'Raw Data Statistics',
            'statusurl': response.headers['location'], // tracking url for task status
            'taskid': response.body.task_id,
            'dataset': req.params.filename,
            'created': today()
        }

        //update task details in user profile
        var update = {'$push': { tasks: responsedata } };
        // get username from currently logged in user
        UserSchema.update({'username': req.user.username}, update, function(err, numAffected){
            if(err){
                console.log('Error updating task metadata : ' + err);
            }
            console.log(numAffected + " tasks updated!");
        });

        console.log(responsedata);
        //send task details to UI
        res.json(responsedata);
    })
});

module.exports = router;