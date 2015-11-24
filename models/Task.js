/**
 * Created by ashishnarkhede on 11/24/15.
 */
var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({

    taskname: {type: String},
    statusurl: {type: String},
    taskid: {type: String},
    dataset: {type:String},
    created: {type: String}
});

module.exports = mongoose.model('Task', TaskSchema, 'Task');