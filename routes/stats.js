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
var RandomForestSchema = mongoose.model('RandomForest');

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
router.get('/raw/drawbridge', function(req, res, next) {
    var casestudy = req.query.casestudy;
   StatsSchema.find({'casestudy': 'drawbridge', 'statstype': 'raw'}, function(err, doc){
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


/**
 * route to get raw statistics for files in drawbridge case study
 */
router.get('/mean/drawbridge', function(req, res, next) {
    var casestudy = req.query.casestudy;
    StatsSchema.find({'casestudy': 'drawbridge', 'statstype': 'mean'}, function(err, doc){
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

router.get('/randomforest/chart', function(req, res, next) {

    var chartType = req.query.type;
    if(chartType.toLowerCase() === 'spline'){

        RandomForestSchema.find({"algorithm" : "Random_Forest"}, function(err, doc) {
            if(err){
                console.log(err);
                response({isError: true, data: err, type: httpStatus.INTERNAL_SERVER_ERROR}, httpStatus.OK, res);
            }
            if(doc) {
                console.log(doc);
                response({isError: false, data: doc, type: httpStatus.OK}, httpStatus.OK, res);
            }
        })
    }
});

router.get('/randomforest/cmatrix', function(req, res, next) {

    var recall = req.query.recall;
    var fmeasure = req.query.fmeasure;

    var query = {"algorithm" : "Random_Forest", 'recall': recall, 'f1': fmeasure};
    var fields = {'precision': 1, 'accuracy': 1, 'true_positive': 1, 'false_positive': 1, 'true_negative': 1, 'false_negative': 1};

    RandomForestSchema.find(query, fields, function(err, doc) {
        if(err){
            console.log(err);
            response({isError: true, data: err, type: httpStatus.INTERNAL_SERVER_ERROR}, httpStatus.OK, res);
        }
        if(doc) {
            console.log(doc);
            response({isError: false, data: doc, type: httpStatus.OK}, httpStatus.OK, res);
        }
    })
});

module.exports = router;