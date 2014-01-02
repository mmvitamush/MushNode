
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('./config');
var MemcachedStore = require('connect-memcached')(express);

var app = express();
var server = http.createServer(app);
var io = require('socket.io');
var skt = io.listen(server);
skt.set('destroy upgrade',false);

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser(config.cookieHash));
app.use(express.session({
    key:'session',
    store:new MemcachedStore()
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

//待ち受け開始
server.listen(app.get('port'),function(){
    console.log("Node.js Server Listening on Port "+app.get('port'));
});

//クライアントが接続してきた時の処理
skt.sockets.on('connection',function(socket){
    console.log('socket.io connection');
    
    socket.on('message',function(data){
        console.log('node.js on message '+' '+data);
        socket.emit('greeting',{message:'Mushroom, '},function(data){
                console.log('result: '+data);
        });
    });
            
    
    //クライアントから切断された時の処理
    socket.on('disconnect',function(){
        console.log('socket disconnect');
    });
});


//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
