/*
 *  サーバー側で動作する
 */

//socket.ioのソケットを管理するオブジェクト
var socketsOf = {};
var config = require('./socketconf');
var radisclient = require('redis').createClient(config.redisPort,config.redisHost),
      async = require('async');
      

exports.init = function(io){
    io.sockets.on('connection',function(socket){
        
        socket.on('clientConnect',function(data){
            console.log(data);
        });
    });
    
    // '/line' namespaceを定義
    var frontLine = io.of('/line').authorization(function(handshakeData,callback){
            //namespace毎の認証
            
            //handshakeData.foo = 'qwertasdfg';
            callback(null,true);
        })
        .on('connection',function(socket){
            //  /line/lineidという細分化をする
            socket.join(socket.handshake.query.lineid);
            socket.on('clientConnect',function(data){
                frontLine.in('1').emit('roomto','1only message');
            });
         });
};

//引数としてクライアントとの通信を行うためのsocketオブジェクトが与えられる
exports.onConnection = function(socket){
    io = exports.io;
    console.log('+*+*+*+*+ io +*+*+*+*+*');
    console.log(io);
    //コネクションが確立されたら'connected'メッセージを送信する
    socket.emit('connected',{});
    socket.on('clientConnect',function(msg){
        //クライアントが接続完了した時に送られてくる. socketには現在サーバーに接続されてる、全socket情報が入っている
        console.log('**************************ClientConnect at Server*********************************');
 //       console.log(socket);
//        console.log('---------------------------------------------------------------------');
        //roomに所属しているidが保存されている
        //console.log(socket.manager.rooms['/line/2']);
//        console.log('---------------------------------------------------------------------');
 //       console.log(socket.manager.roomClients[socket.id]);
 //       console.log('---------------------------------------------------------------------');
 //onsole.log(socket.namespace.name);
 //       console.log('socket join :'+socket.namespace.name);
 //       console.log('***********************************************************');
       //socketsOf[socket.namespace.name] = socket;
    });
    
    
    //ソケットが切断された場合
    socket.on('disconnect',function(){
        console.log('id:'+socket.sessionid+' Disconnect.');
    });
};

exports.pushPoints = function(req,res){
    console.log(req.body);
    console.log('-------------------------------------------------------------------');
    
    //var allskt = socketsOf;
    //var roomsockets = socketsOf['/line/'+req.body.lineid];
    //console.log(roomsockets.manager.rooms['/line/'+req.body.lineid]);
    //console.log('-------------------------------------------------------------------');
    //console.log(roomsockets);
    //console.log('-------------------------------------------------------------------');
    //console.log(socketsOf);
    //roomsockets.broadcast.emit('roomsend',req.body);
    io.of('/line/'+req.body.lineid).emit('roomsend',req.body);
    //var io = exports.io;
    //var members = Object.keys(allsockets['sc.js']);
    //io.sockets.emit('res',req.body);
    //var skt = allsockets['sc.js'];
    //skt.emit('res',req.body);
    //console.log(skt);
    //Object.keys(skt).forEach(function(key){
   //    console.log('key -> '+key);
   //     console.log(skt[key]);
   // });
   //roomsockets.emit('roomsend','roomsocket:send');
   //allskt.emit('roomsend','allsockets:send');
   
    console.log('realtimesockets : pushPoints');
    res.send(200);
    return;
};