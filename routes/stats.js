/**
 * Created by ashishnarkhede on 12/5/15.
 */
/**
 * Created by ashishnarkhede on 11/24/15.
 */
var express = require('express');
var aws = require('aws-sdk');
var httpStatus = require('http-status-codes');
var q = require('q');

var router = express.Router();

var mongoose = require('mongoose');
var StatsSchema = mongoose.model('Stats');

// middleware to test user authentication before processing a request on a route
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
 * route to get raw statistics for files in drawbridge case study
 */
router.get('/drawbridge', function(req, res, next) {
    var casestudy = req.query.casestudy;
   StatsSchema.find({'casestudy': 'drawbridge'}, function(err, doc){
       if(err) {
           console.log(err);
           response({isError: true, data: err, type: httpStatus.INTERNAL_SERVER_ERROR}, httpStatus.OK, res);
       }
       if(doc){
           console.log(doc[0].values);
           response({isError: false, data: doc, type: httpStatus.OK}, httpStatus.OK, res);
       }
   });
});


module.exports = router;