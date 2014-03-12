
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('./config');
var async = require('async');
var SessionStore = require('connect-redis')(express);
var realtimesockets = require('./sockets/realtime');

var app = express();

var server = http.createServer(app);

var redisport = config.redisPort,
      redishost = config.redisHost;
var RedisStore = require('socket.io/lib/stores/redis'),
      redis = require('redis'),
      pub = redis.createClient(redisport,redishost),
      sub = redis.createClient(redisport,redishost),
      redisclient = redis.createClient(redisport,redishost);
      
var sub1 = redis.createClient(redisport,redishost),
      sub2 = redis.createClient(redisport,redishost);
// Socket.IO
var io = require('socket.io').listen(server,{
    'store':new RedisStore({
        redisPub:pub,
        redisSub:sub,
        redisClient:redisclient
    }),
    'log level':1,
    'authorization':function(handshake,callback){
        //グローバル認証
        //var id = handshake.query.id;
        //if(!io.namespaces.hasOwnProperty('/line/'+id)){
            //var room = io.of('/line/'+id);
            //room.on('connection',realtimesockets.onConnection);
        //}
        callback(null,true);
    }
});

      
realtimesockets.init(io);

sub1.subscribe('linepub');
sub1.on('message',function(channel,message){
    console.log(message);
     var obj = JSON.parse(message);
     var obj_wk = {
                    lineid:obj.lineid,
                    lineno:obj.lineno,
                    celsius:obj.celsius,
                    humidity:obj.humidity,
                    setcelsius:obj.setcelsius,
                    sethumidity:obj.sethumidity,
                    mcn1:obj.mcn1,
                    mcn2:obj.mcn2,
                    t_date:obj.t_date
                };
     //io.of('/line').in('1').emit('roomto',{celsius:obj.celsius,humidity:obj.humidity,t_date:obj.t_date});
     io.of('/summary').emit('roomto',obj);
});

sub2.subscribe('changeSchedule');
sub2.on('message',function(channel,message){
     var obj = JSON.parse(message);
    io.of('/summary').emit('changeSchedule',obj);     
});


//動的に名前空間を追加する
/*
io.configure(function(){
    io.set('authorization',function(handshake,callback){
        
        var id = handshake.query.id;
        if(!io.namespaces.hasOwnProperty('/line/'+id)){
            var room = io.of('/line/'+id);
            room.on('connection',realtimesockets.onConnection);
        }
        callback(null,true);
    });
});
*/

//realtimesockets.io = io;

/*
var redis = require('redis');
var subscriber = redis.createClient(config.redisPort,config.redisHost);
subscriber.subscribe('hoge channel');
subscriber.on('message',function(channel,message){
    console.log(channel + ' : ' + message);
});
*/

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
    store:new SessionStore({
        host:redishost,
        port:redisport,
        client:redis.createClient()
    }),
    cookie:{
        httpOnly:false,
        maxAge:new Date(Date.now() + 60 * 60 * 10)
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
app.get('/record/:lineId',routes.record);
app.get('/line/:lineId',routes.line);
app.get('/summary',routes.summary);
app.get('/sample/:lineid/:lineno',routes.sample);
app.get('/schedule/:lineid/:lineno',routes.schedule);
app.post('/api/getRecordData',routes.getRecordData);
app.post(﻿'/api/getchart',routes.getChart);
app.post(﻿'/api/getlog',routes.getLog);
app.post('/api/changesetting',routes.changesetting);
app.post('/api/getsetting',routes.getsetting);
app.post('/api/getTimeSchedule',routes.getTimeSchedule);
app.post('/api/deleteTimeSchedule',routes.deleteTimeSchedule);
app.post('/api/deletecache',routes.deleteCache);
app.post('/api/updateTimeSchedule',routes.updateTimeSchedule);
app.post('/api/getS3Photo',routes.getS3Photo);
app.post('/api/getUsers',routes.getUsers);
app.post('/mail/send',routes.sendmail);
//app.post('/api/wsgate',realtimesockets.pushPoints); 廃止

//待ち受け開始
server.listen(app.get('port'),function(){
    console.log("Node.js Server Listening on Port "+app.get('port'));
});

//socket.ioのコネクション設定
//イベントハンドラーには引数としてクライアントとの通信を行うためのsocketオブジェクトが与えられる
//io.sockets.on('connection',realtimesockets.onConnection);



//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
