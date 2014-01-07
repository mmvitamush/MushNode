
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('./config');
var MongoStore = require('connect-mongo')(express);
var realtimesockets = require('./sockets/realtime');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server,{log:false});
realtimesockets.io = io;

//skt.set('destroy upgrade',false);

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.cookieParser(config.cookieHash));
app.use(express.cookieParser());
app.use(express.session({
//    key:'session',
    secret:'secret',
    store:new MongoStore({
        db:'mushroom',
        host:'127.0.0.1',
        clear_interval:60 * 60
    }),
    cookie:{
        httpOnly:false,
        maxAge:new Date(Date.now() + 60 * 60 * 1000)
    }
}));
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/login',routes.login);
app.post('/login',routes.login.post);
app.get('/logout',routes.logout);

app.get('/dashboard',routes.dashboard);
app.get('/record',routes.record);
app.post('/api/getRecordData',routes.getRecordData);
app.post(﻿'/api/getchart',routes.getChart);
app.post(﻿'/api/getlog',routes.getLog);
app.post('/api/wsgate',realtimesockets.pushPoints);

//待ち受け開始
server.listen(app.get('port'),function(){
    console.log("Node.js Server Listening on Port "+app.get('port'));
});

//socket.ioのコネクション設定
//イベントハンドラーには引数としてクライアントとの通信を行うためのsocketオブジェクトが与えられる
io.sockets.on('connection',realtimesockets.onConnection);

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
