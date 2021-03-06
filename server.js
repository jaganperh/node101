
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , mongoDatasvc = require('./routes/mongo')
  , queuesvc = require('./routes/queue')
  , sortedSetSvc = require('./routes/sortedSet')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.all('/collections', mongoDatasvc.mongoDatasvc);
app.all('/collections/*', mongoDatasvc.mongoDatasvc);
app.all('/queues', queuesvc.queuesvc)
app.all('/queues/*', queuesvc.queuesvc)
app.all('/sortedsets', sortedSetSvc.sortedSetSvc)
app.all('/sortedsets/*', sortedSetSvc.sortedSetSvc)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
