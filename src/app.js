var express = require('express');
var routes  = require('./routes/route-index');
var cors    = require('cors'); 
var logger  = require('morgan');
var bodyParser = require('body-parser');

var app = express();
app.use(logger('dev'));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.use(cors());
app.use('/', routes);

var server = app.listen(8002,'localhost', function() {
    console.log('Server listening on port ' + server.address().port);
});
module.exports = app;