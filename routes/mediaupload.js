/**
 * Created by ashishnarkhede on 11/16/15.
 */
var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');

var fs = require('fs');
var S3Config = JSON.parse(fs.readFileSync('./env/aws.json', 'utf8'));

console.log(S3Config.AWS_ACCESS_KEY);
console.log(S3Config.AWS_SECRET_KEY);
console.log(S3Config.S3_BUCKET);


// configure aws credentials
var AWS_ACCESS_KEY = S3Config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = S3Config.AWS_SECRET_KEY;
var S3_BUCKET = S3Config.S3_BUCKET;


// route to get the S3 signed request for the file being uploaded
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