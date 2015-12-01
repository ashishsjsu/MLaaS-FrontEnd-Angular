/**
 * Created by ashishnarkhede on 11/24/15.
 */
var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({

    username: {type: String},
    taskname: {type: String},
    tasktype: {type: String},
    statusurl: {type: String},
    taskid: {type: String},
    datasource: {type:String},
    created: {type: String}
});

module.exports = mongoose.model('Task', TaskSchema, 'Task');