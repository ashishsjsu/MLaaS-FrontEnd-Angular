/**
 * Created by ashishnarkhede on 11/22/15.
 * Note: All routes in this file are prefixed with /datasource.
 */

var express = require('express');
var aws = require('aws-sdk');
var httpStatus = require('http-status-codes');

var router = express.Router();

var mongoose = require('mongoose');
var UserSchema = mongoose.model('User');
var FileSchema = mongoose.model('Files');

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


/**
 * METHOD: GET
 * This route gets a list of data sources for a user
 */
router.get('/', function(req, res, next){

    FileSchema.find({'username': req.query.user}, function(err, data){
        if(err){
            response({'isError': true, data:err}, httpStatus.INTERNAL_SERVER_ERROR, res);
        }
        if(data){
            console.log(data);
            response({'isError': false, 'data': data}, httpStatus.OK, res);
        }
    });
});

/**
 * METHOD: POST
 * This route saves the data source and/or updates the metadata for the data source uploaded by the user
 */
router.post('/', function(req, res, next) {
    // get column names from the req body
    var columns = JSON.parse(req.body.columns);

    var update = {'$pushAll': { 'columns': columns }};
    var query = {'username': req.body.username, 'filename': req.body.filename}

    // create a file object to save
    var file = {
        'username': req.body.username,
        'filename': req.body.filename,
        'date': req.body.date
    };
    // create an instance of file schema
    var files = new FileSchema(file);
    // save the data source / file object
    files.save(files, function(err, doc){
        if(err){
            console.log(err);
            res.json(err);
        }
        console.log("Saved: " + doc);

        if(doc !== null || doc !== undefined){
            // if data source is saved successfully, update its metadata
            FileSchema.update(query, update, function(err, data){
                if(err){
                    console.log(err);
                    response({'data': err, 'isError': true}, httpStatus.INTERNAL_SERVER_ERROR, res);
                }
                console.log(data);
                //send the success response with msg, status and flag
                response({'data': data.nModified, 'isError': false}, httpStatus.OK, res);

            });
        }
    });
});

/**
 *  This route gets an AWS S3 signed request for the data file being uploaded
 */
router.get('/upload/sign_request', function(req, res, next){

    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.filename,
        Expires: 60,
        ContentType: req.query.filetype,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var payload = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
            };
            res.write(JSON.stringify(payload));
            res.end();
        }
    });
});


module.exports = router;