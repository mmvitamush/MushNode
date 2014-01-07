/*
 *  サーバー側で動作する
 */

//socket.ioのソケットを管理するオブジェクト
exports.socketsOf = {};

//引数としてクライアントとの通信を行うためのsocketオブジェクトが与えられる
exports.onConnection = function(socket){
    var socketsOf = exports.socketsOf;
    //コネクションが確立されたら'connected'メッセージを送信する
    socket.emit('connected',{});
    
    socket.on('login',function(client){
        socketsOf[client.user] = socket;
        console.log('client --> server : mes - login.');
    });
    
    //ソケットが切断された場合
    socket.on('disconnect',function(){
        
    });
};

exports.pushPoints = function(req,res){
    console.log(req.body);
    var allsockets = exports.socketsOf;
    var io = exports.io;
    //var members = Object.keys(allsockets['sc.js']);
    io.sockets.emit('res',req.body);
    //var skt = allsockets['sc.js'];
    //console.log(skt);
    //Object.keys(skt).forEach(function(key){
   //    console.log('key -> '+key);
   //     console.log(skt[key]);
   // });
    console.log('realtimesockets : pushPoints');
};