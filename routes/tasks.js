/**
 * Created by ashishnarkhede on 11/24/15.
 */
var express = require('express');
var aws = require('aws-sdk');
var httpStatus = require('http-status-codes');
var unirest = require('unirest');

var router = express.Router();

var mongoose = require('mongoose');
var UserSchema = mongoose.model('User');
var FileSchema = mongoose.model('Files');
var TaskSchema = mongoose.model('Task');

var fs = require('fs');
var S3Config = JSON.parse(fs.readFileSync('./env/aws.json', 'utf8'));

// configure aws credentials
var AWS_ACCESS_KEY = S3Config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = S3Config.AWS_SECRET_KEY;
var S3_BUCKET = S3Config.S3_BUCKET;

var ensureAuthenticated = require('../modules/ensureAuthenticated');

/**
 * Responds the user for any request
 *
 * @param message
 * @param status
 * @param res
 */
var response = function(message, status, res) {
    res.status(status).send(message);
};


function createRawStatisticsTask(datasource) {

}

/**
 * This route creates a new task when requested by a logged in user
 */
router.post('/', function(req, res, next){

    console.log(req.query.type);

    if(req.query.type.toLowerCase() === "rawstatistics") {
        createRawStatisticsTask(req.body.filename);
    }

    // enque a new task into the celery queue
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
                'created': getToday()
            }

            //update task details in user profile
            var update = {'$push': { tasks: responsedata } };
            // get username from currently logged in user
            PersonSchema.update({'username': req.user.username}, update, function(err, numAffected){
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