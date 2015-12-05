/**
 * Created by ashishnarkhede on 12/3/15.
 */
var mongoose = require('mongoose');

var AlgorithmSchema = new mongoose.Schema({

    name: {type: String},
    description: {type: String},
    parameters: []
});

module.exports = mongoose.model('Algorithms', AlgorithmSchema, 'Algorithms');