var device_num = [];
$(document).ready(function(){
    $('.simple-menu').sidr();   
});

$(function(){
    $('#status-pagination > li').click(function(){
        var num = $(this).children('a').html();
        var baseposition =$('#observTable').position().top;
        var targetposition = $('#device-'+num+'-1').position().top+100;
        $('body').animate({scrollTop:targetposition - baseposition},
                {
                    duration:400,
                    easing:"swing"
                });
    });
});

var check_func;
$(window).load(function(){
    var  socket1 = io.connect('/summary');
    socketInit(socket1);   
    var doc = $('.table > tbody > tr[id^=device]');
    var str;
    for(var i =0; i<doc.length; i++){
        str = $(doc[i]).attr("id").split('-');
        device_num.push({lineid:str[1],lineno:str[2]});
    }
    check_func = setInterval('check_status()',10000);
});

//socket.ioの設定
function socketInit(socket,obj){
     //サーバーと接続されたらプログレスバーを変更
     socket.on('connect',function(){
         console.log('socket connect.');
         if($('#info-progress.progress-bar').hasClass('progress-bar-warning')){
                $('#info-progress.progress-bar').removeClass('progress-bar-warning').addClass('progress-bar-success');
                $('#info_p').text('\u00a0受信中...');
         };
     });
     
     //サーバーから接続完了のメッセージが来たらlineidとlinenoを渡す
     socket.on('connected',function(){
         console.log('socket connected.');
         //socket.json.emit('init',{'lineid':obj.lineid});
     });
     
     //サーバーからredisのpublish情報を受け取った
     socket.on('roomto',function(obj){
         console.log(obj);
            change_table_col(obj);
     });
     
     socket.on('changeSchedule',function(obj){
            console.log('socket changeSchedule');
            console.log(obj);
     });
     
     socket.on('disconnect',function(){
         console.log('socket disconnect.');
         if($('#info-progress.progress-bar').hasClass('progress-bar-success')){
                $('#info-progress.progress-bar').removeClass('progress-bar-success').addClass('progress-bar-warning');
                 $('#info_p').text('\u00a0サーバーと再接続中...');
         };
     });
}

//一定時間更新がない場合、警告文を表示する
function check_status(){
    console.log('check_status.');
    var device_tr,prevdate,nowdate;
    for(var i = 0; i<device_num.length; i++){
        device_tr = $('#device-'+device_num[i].lineid+'-'+device_num[i].lineno);
        prevdate = device_tr.children('td').eq(5).text();
        if(prevdate !== ""){
            nowdate = new Date/1000|0;
            prevdate = new Date(prevdate)/1000|0;
            
            if((nowdate-prevdate) > 20){//Danger
                $('#status-pagination > li').eq(device_num[i].lineid).children('a').css('background','red');
                device_tr.children('td').eq(6).text('change of check_status').css('color','red'); 
                device_tr.children('td').eq(2).text('Danger').css('color','red');
            } else if((nowdate-prevdate) > 10){//Warning
                $('#status-pagination > li').eq(device_num[i].lineid).children('a').css('background','orange');
                device_tr.children('td').eq(6).text('change of check_status').css('color','orange');
                device_tr.children('td').eq(2).text('Warning').css('color','orange');
            } else {
                $('#status-pagination > li').eq(device_num[i].lineid).children('a').css('background','#FFFFFF');
                device_tr.children('td').eq(6).text('').css('color','#FFFFFF');   
                device_tr.children('td').eq(2).text('OK').css('color','green');
            }
        }
    }
};

//テーブル内容の書き換え
function change_table_col(obj) {
    var line = '-'+obj.lineid+'-'+obj.lineno;
    var device_tr = $('#device'+line);
    var temp_tr = $('#Temperature'+line);
    var humd_tr = $('#Humidity'+line);
    var co2_tr = $('#Co2'+line);
    
    device_tr.children('td').eq(2).text('OK').css('color','green');
    device_tr.children('td').eq(5).text(computeDuration(parseInt((new Date)/1000)));
    
    temp_tr.children('td').eq(1).text(obj.celsius);
    temp_tr.children('td').eq(2).text(obj.top_range1 + '～' + obj.bottom_range1);
    temp_tr.children('td').eq(3).text(obj.vent_value1);
    temp_tr.children('td').eq(4).text(computeDuration(parseInt((new Date)/1000)));
    
    humd_tr.children('td').eq(1).text(obj.humidity);
    humd_tr.children('td').eq(2).text(obj.top_range2 + '～' + obj.bottom_range2);
    humd_tr.children('td').eq(3).text(obj.vent_value2);
    humd_tr.children('td').eq(4).text(computeDuration(parseInt((new Date)/1000)));
    
    co2_tr.children('td').eq(1).text(obj.co2);
    co2_tr.children('td').eq(2).text(obj.top_range4 + '～' + obj.bottom_range4);
    co2_tr.children('td').eq(3).text(obj.vent_value4);
    co2_tr.children('td').eq(4).text(computeDuration(parseInt((new Date)/1000)));    
}

function computeDuration(ms){
    //var data = new Date(ms-32400000);
    var data = new Date(ms*1000);
    var Y = data.getFullYear();
    var M = toDoubleDigits(data.getMonth()+1);
    var D = toDoubleDigits(data.getDate());
    var hh = toDoubleDigits(data.getHours());
    var mm = toDoubleDigits(data.getMinutes());
    var ss = toDoubleDigits(data.getSeconds());
  
    return Y+'/'+M+'/'+D+' '+hh+':'+mm+':'+ss;
}

//0埋め
function toDoubleDigits(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};
