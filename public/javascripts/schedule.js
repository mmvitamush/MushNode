var lineid,lineno;
$(document).ready(function(){
    var url = document.URL;
    lineid = url.split('/')[4];
    lineno = url.split('/')[5];

    $('.simple-menu').sidr();
    $('#range1').rangeSlider({
       bounds:{min: 0, max: 100},
       defaultValues:{min:0,max:10},
       arrows:false,
       step:1
   });
   $('#RelaySelector').on('change',function(){
       if($('#RelaySelector option:selected').val() !== '0'){
           $('#RelayLabel').html($('#RelaySelector option:selected').text().substr(7,2));
       }else{
           $('#RelayLabel').html('選択してください');
       }
   });
   
});

$(function(){
    //データタイムピッカー
   $('#datetimepicker1').datetimepicker({
	addSliderAccess: true,
	sliderAccessArgs: { touchonly: false },
	changeMonth: false,
	changeYear: false,
                  dateFormat:'yy/mm/dd'
        });
        
   $('#datetimepicker2').datetimepicker({
	addSliderAccess: true,
	sliderAccessArgs: { touchonly: false },
	changeMonth: false,
	changeYear: false,
                  dateFormat:'yy/mm/dd'
        });
        
   $('#setBtn').click(function(){
       var setData = {
           lineid:lineid,
           lineno:lineno,
           relaySelect:$('#RelaySelector option:selected').val(),
           rangeMin:$('#range1').rangeSlider("min"),
           rangeMax:$('#range1').rangeSlider("max"),
           topRangeOver:$('[name=TopRange]:checked').val(),
           bottomRangeOver:$('[name=BottomRange]:checked').val(),
           start:Math.round((new Date($('#datetimepicker1').val())).getTime()/1000),
           end:Math.round((new Date($('#datetimepicker2').val())).getTime()/1000)
       };
       var rep = ajaxLoading('http://www.vita-factory.com/api/changesetting','post','json',setData);
       console.log(rep);
   });
   
   $('#schedulegetBtn').click(function(){
       var setData = {
           lineid:lineid,
           lineno:lineno,
           relaySelect:$('#RelaySelector option:selected').val()
       };
       if($('#RelaySelector option:selected').val() !== '0'){
            var rep = ajaxLoading('http://www.vita-factory.com/api/getTimeSchedule','post','json',setData);
            console.log(rep);
       }
   });
});

$(window).load(function(){
    
});

function setUserlist(rep) {
    var chk = ['','checked'];
    var doc = $('#mailSettingBody');
    var i = 1;
    rep.forEach(function(v){
        doc.append($('<tr id="settingtr'+i+'"></tr>')
                .append($('<td><span class="glyphicon glyphicon-user"></span></td>'))
                .append($('<td>'+v.username+'</td>'))
                .append($('<td>'+v.mailaddress+'</td>'))
                .append($('<td>\n\
                <div class="checkbox chk-c"><label><input type="checkbox" '+chk[v.maildanger]+' /> 異常</label></div>\n\
                <div class="checkbox chk-c"><label><input type="checkbox" '+chk[v.mailwarning]+' /> 警告</label></div>\n\
                </td>'))
                .append($('<td><button id="mailSendBtn'+i+'" class="btn btn-danger" type="button">設定変更</button></td>'))
        );
        i++;
    });
}

//非同期通信でサーバからデータを受信する
function ajaxLoading(url,type,dataType,data){
    var res;
        $.ajax({
             url: url,
             type: type,
             dataType:dataType,
             data:data,  
             async:false,
             timeout: 20000,
               //送信前
             beforeSend:function(xhr,settings) {},
               //応答後
             complete: function(xhr,textStatus) {},
               //通信成功時の処理
             success:function(result,textStatus,xhr) {
                         res = result;
                   },
               //失敗時の処理
             error:function(xhr, textStatus, error) {
                    res = false;
               }
           });
           return res;
       }  

//sliderの値をチェックしてボタンのdisable属性を切り替える
function checkSliderPoints(type){
var flg = true;
        if(($('#slider'+type).slider("value") > $('#range'+type).rangeSlider("max")) || 
            ($('#slider'+type).slider("value") < $('#range'+type).rangeSlider("min"))){
               $('#range'+type).prevAll('span.warning-span').css('opacity',1).html('設定値が正しくありません');
               rangeBtnable [type] = false;
         } else {
               rangeBtnable[type] = true;       
               $('#range'+type).prevAll('span.warning-span').css('opacity',0);
         }
 
         for(var key in rangeBtnable){
             if(rangeBtnable[key] === false){
                 flg = false;
             }
         }
         if(flg){
             $('#sliderBtn').removeAttr('disabled');
         }else{
             $('#sliderBtn').attr('disabled','disabled');
         }
};

//0埋め
function toDoubleDigits(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

//ミリ秒を時分秒へ変換
function computeDurationTime(ms){
    //var data = new Date(ms-32400000);
    var data = new Date(ms*1000);
    var hh = toDoubleDigits(data.getHours());
    var mm = toDoubleDigits(data.getMinutes());
    //var ss = toDoubleDigits(data.getSeconds());
  
    //return hh+':'+mm+':'+ss;
    return hh+':'+mm;
}

function nowD(){
    var data = new Date();
    var Y = data.getFullYear();
    var M = data.getMonth()+1;
    var D = data.getDate();
    return String(Y)+String(toDoubleDigits(M))+String(toDoubleDigits(D));
};

//ミリ秒を日時へ変換
function computeDuration(ms){
    //var data = new Date(ms-32400000);
    var data = new Date(ms*1000);
    var Y = data.getFullYear();
    var M = data.getMonth()+1;
    var D = data.getDate();
    var hh = toDoubleDigits(data.getHours());
    var mm = toDoubleDigits(data.getMinutes());
    var ss = toDoubleDigits(data.getSeconds());
  
    return Y+'/'+M+'/'+D+' '+hh+':'+mm+':'+ss;
}

//与えられた x が数値か、もしくは文字列での数字かどうかを調べる。数値または数字なら true.
function isNumber(x){ 
    if( typeof(x) != 'number' && typeof(x) != 'string' )
        return false;
    else 
        return (x == parseFloat(x) && isFinite(x));
}

function getUnixTime(num){
    var t = new Date(num);
    var u = Math.round(t.getTime()/1000);
    return u;
}