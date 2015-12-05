var mongoose = require('mongoose');

var StatsSchema = new mongoose.Schema({
    casestudy: {type: String},
    statstype: {type: String},
    filename: {type: String},
    values: [],
    noplotvalues: []
});

module.exports = mongoose.model('Stats', StatsSchema, 'Stats');