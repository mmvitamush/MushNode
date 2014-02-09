/*
 *  サーバー側で動作する
 */

//socket.ioのソケットを管理するオブジェクト
var socketsOf = {};
var config = require('./socketconf');
var radisclient = require('redis').createClient(config.redisPort,config.redisHost);
//var frontLine;
      

exports.init = function(io){
    /*
    io.sockets.on('connection',function(socket){
        console.log('ccccc');
        socket.on('clientConnect',function(data){
            console.log(data);
        });
    });
    */
    
    // '/line' namespaceを定義
    io.of('/line').authorization(function(handshakeData,callback){
            //namespace毎の認証
            console.log('/line authorization');
            //handshakeData.foo = 'qwertasdfg';
            callback(null,true);
        })
        .on('connection',function(socket){
            //  /line/lineid:linenoという細分化をする
            console.log('/line connection.');
            socket.join(socket.handshake.query.lineid+':'+socket.handshake.query.lineno);
            socket.on('clientConnect',function(data){
                
            });
         });
         
     var summary = io.of('/summary').on('connection',function(client){
         console.log('/summary on connection.');
         client.emit('connected');
         client.on('init',function(req){
             //client.set('lineid',req.lineid);
             //summary.to(req.lineid).emit('System','Summary Socket.');
             //client.emit('System','Summary Client.');
             //client.join(req.lineid);
             console.log(io.sockets.manager.rooms);
             console.log('**********************************************************');
             //client.json.emit('initialized',{'lineid':req.lineid});
         });
         
         client.on('disconnect',function(){
             var lineid,lineno;
             client.get('lineid',function(err,_lineid){
                 lineid = _lineid;
             });
            
             client.leave(lineid);
         });
     });
         
     
};

//引数としてクライアントとの通信を行うためのsocketオブジェクトが与えられる
/*
exports.onConnection = function(socket){
    io = exports.io;
    console.log('+*+*+*+*+ io +*+*+*+*+*');
    console.log(io);
    //コネクションが確立されたら'connected'メッセージを送信する
    socket.emit('connected',{});
    socket.on('clientConnect',function(msg){
        //クライアントが接続完了した時に送られてくる. socketには現在サーバーに接続されてる、全socket情報が入っている
        console.log('**************************ClientConnect at Server*********************************');
//        console.log('---------------------------------------------------------------------');
        //roomに所属しているidが保存されている
        //console.log(socket.manager.rooms['/line/2']);
//        console.log('---------------------------------------------------------------------');
 //       console.log(socket.manager.roomClients[socket.id]);
 //       console.log('---------------------------------------------------------------------');
    });
    
    
    //ソケットが切断された場合
    socket.on('disconnect',function(){
        console.log('id:'+socket.sessionid+' Disconnect.');
    });
};
*/
/*
exports.pushPoints = function(req,res){
    console.log(req.body);
    frontLine.in(req.body.lineid).emit('roomto',req.body);
    //roomsockets.broadcast.emit('roomsend',req.body);
    //io.of('/line/'+req.body.lineid).emit('roomsend',req.body);
    res.send(200);
    return;
};
*/ //廃止