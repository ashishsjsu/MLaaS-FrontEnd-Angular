var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');

/* Configure the elasticseach client */
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

/* Setup mongo db */
var mongoose = require('mongoose');
mongoose.connect('mongodb://cmpe280:cmpe280@ds051843.mongolab.com:51843/user');
require('./models/User');
require('./models/Files');
require('./models/Task');
require('./models/Algorithms');
require('./models/Stats');


var index = require('./routes/index');
var datasource = require('./routes/datasource');
var tasks = require('./routes/tasks');
var statistics = require('./routes/stats');

var app = express();

//require the passport module for authentication
var passport = require('passport');
require('./modules/passportconfig').configurePassportAuthentication(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'images','favicon.ico')));
app.use(logger('dev'));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// required for passportjs
app.use(session({ secret: 'mynotsogoodsecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static( path.join(__dirname, '/bower_components')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', index);
app.use('/datasource', datasource);
app.use('/tasks', tasks);
app.use('/stats', statistics);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
