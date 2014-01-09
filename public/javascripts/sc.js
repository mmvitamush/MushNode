var socket1;
var lineId;
$(document).ready(function() {
    var url = document.URL;
    lineId = url.split('/')[4];
});

$(function(){
    //socket1 = io.connect('http://www.vita-factory.com/line/'+lineId+'?id='+lineId);
    socket1 = io.connect('/line'+'?lineid='+lineId);
    
    //socket1.emit('login',{user:'sc.js'});
    socket1.on('connect',function(){
        socket1.emit('clientConnect','LINEID:'+lineId+'.send');
    });
    
    socket1.on('roomto',function(msg){
        console.log(msg);
    });
    
});

