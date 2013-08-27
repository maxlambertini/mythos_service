
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var mythos = require('./routes/mythos');
var ab = require('./routes/about');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 51666);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/mythos/:monsters?/:tabular?', mythos.creature) 
app.get('/json/mythos/:monsters?/:tabular?', mythos.jsonCreature);

//more json stuff
app.get('/json/eldergods/:num?', mythos.jsonElderGods);
app.get('/json/people/:num?', mythos.jsonPeople);
app.get('/json/names/:num?', mythos.jsonNames);
app.get('/json/adjectives/:num?',mythos.jsonAdjectives);

app.get('/about', ab.about);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});