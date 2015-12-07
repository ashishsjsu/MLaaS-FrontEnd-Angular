/**
 * Created by ashishnarkhede on 12/5/15.
 */
var mongoose = require('mongoose');

var RandomForestSchema = new mongoose.Schema({
    algorithm : {type: String},
    library: {type: String},
    criterion: {type: String},
    estimators: {type: Number},
    max_depth: {type: Number},
    trees: {type: Number},
    accuracy: {type: Number},
    precision: {type: Number},
    recall: {type: Number},
    f1: {type: Number},
    test_error: {type: Number},
    features: {type: Number},
    true_positive: {type: Number},
    true_negative: {type: Number},
    false_positive: {type: Number},
    true_negative: {type: Number}


});

module.exports = mongoose.model('RandomForest', RandomForestSchema, 'RandomForest');