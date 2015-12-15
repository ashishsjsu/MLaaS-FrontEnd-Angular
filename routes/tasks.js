/**
 * Created by ashishnarkhede on 11/24/15.
 */
var express = require('express');
var aws = require('aws-sdk');
var httpStatus = require('http-status-codes');
var unirest = require('unirest');
var q = require('q');

var router = express.Router();

var mongoose = require('mongoose');
var TaskSchema = mongoose.model('Task');
var AlgorithmSchema = mongoose.model('Algorithms');

// middleware to test user authentication before processing a request on a route
var ensureAuthenticated = require('../modules/ensureAuthenticated');

/**
 * Return todays date
 * @returns {string}
 */
var today = function(){
    var today = new Date();
    var date = today.getMonth() + "/" + today.getDate() + "/" + today.getYear() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date;
};

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

/**
 * Save the metadata for the task created by the user
 * @param req
 * @param res
 * @param taskname
 */
function createRawStatisticsTaskMetadata(req, res, taskname) {

    var deferred  = q.defer();
    var object = {};
    var taskDocId =  null;
    //currently logged in user
    var username = req.user.username;
    //first save the task metadata in mongodb
    var task = {
        'username': username,
        'taskname': taskname,
        'tasktype': req.query.type.toLowerCase(),
        'datasource': req.body.filename,
        'created': today()
    }

    var Task = new TaskSchema(task);
    // save the task metadata
    Task.save(function(err, doc){
       if(err) {
           object.isError = true;
           object.errorMessage = err;
           object.type = httpStatus.OK;
           //console.log(err);
           deferred.resolve(object);
       }
       else {
           // save the task document id for updating the doc with task_id and statusurl
           taskDocId = doc._id;
           object.isError = false;
           object.data = taskDocId;
           object.type = httpStatus.OK;
           deferred.resolve(object);
       }
    });

    return deferred.promise;
}

/**
 * This method adds a task to the Celery task queue
 * @param type - task type
 * @param datasource - datasource url
 * @param taskId - taskId for the mongodb doc to be updated on task queuing
 */
function enqueueTask(type, datasource, taskDocId) {

    var deferred = q.defer();
    var object= {};

    // enque a new task into the celery queue
    unirest.post('http://localhost:5000/' + type + '/' + datasource)
     .header('Accept', 'application/json')
     .send({'datasource': datasource })
     .end(function(response){
     // return a json response with task status url, task id, task name
     var responsedata = {
         'statusurl': response.headers['location'], // tracking url for task status
         'taskid': response.body.task_id,
         'created': today()
     }

     //update task details
     var update = responsedata;
     // set options to return the updated document
     var options = {new: true};
     // use findByIdAndUpdate to return the updated document from the collection
     TaskSchema.findOneAndUpdate({'_id': taskDocId}, update, options, function(err, doc){
         if(err){
             console.log('Error updating task metadata : ' + err);
             object.isError = true;
             object.data = responsedata;
             object.type = httpStatus.OK;
             deferred.resolve(object);
         }
         else {
            object.isError = false;
            object.data = responsedata;
            object.data.tasktype = type;
            object.data.datasource = datasource;
            object.type = httpStatus.OK;
            deferred.resolve(doc);
         }
         console.log(doc + " tasks updated!");
     });
    });

    return deferred.promise;
}


/**
 * This route creates a new task when requested by a user
 */
router.post('/', function(req, res, next){

    console.log(req.query.type);

    if(req.query.type.toLowerCase() === "rawstatistics") {
        createRawStatisticsTaskMetadata(req, res, 'Raw Data Statistics').done(function(obj) {

            enqueueTask('statistics', req.body.filename, obj.data).done(function(obj){
                response(obj, httpStatus.OK, res);
            });
        });
    }

    if(req.query.type.toLowerCase() === "transformation") {
        createRawStatisticsTaskMetadata(req, res, 'Data transformation').done(function(obj) {

            enqueueTask('transform', req.body.filename, obj.data).done(function(obj){
                response(obj, httpStatus.OK, res);
            });
        });
    }


});

/**
 * This route gets the list of tasks created by the user
 */
router.get('/', function(req, res, next) {

    TaskSchema.find({'username': req.query.user}).sort({date: -1}).exec(function(err, data){
        if(err){
            response({'isError': true, data:err}, httpStatus.INTERNAL_SERVER_ERROR, res);
        }
        if(data){
            console.log(data);
            response({'isError': false, 'data': data}, httpStatus.OK, res);
        }
    });
});

module.exports = router;