var socket1;
$(function(){
    socket1 = io.connect();
    socket1.emit('login',{user:'sc.js'});
    
    socket1.on('res',function(req){
        console.log(req);
    });
});

