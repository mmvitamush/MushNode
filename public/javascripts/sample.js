var param1,param2,lineid,graphData,plot,gfd,options,targetLine;
var sColors = {
   celsData:'#FE8926',
   humdData:'#14B9D6',
   setcelsius:'',
   sethumidity:'',
   celsiusup:'',
   celsiusdw:'',
   humidityup:'',
   humiditydw:''
},
sLabels = {
   celsData:{label:'温度'},
   humdData:{label:'湿度'},
   setcelsius:{label:'設定温度'},
   sethumidity:{label:'設定湿度'},
   celsiusup:{label:'温度UP'},
   celsiusdw:{label:'温度DW'},
   humidityup:{label:'湿度UP'},
   humiditydw:{label:'湿度DW'}
};

//初期値のセット
var stackColor = [sColors.celsData,sColors.humdData],
       stackLabel = [sLabels.celsData,sLabels.humdData],
       prevPoints = {'celsius':0,'humidity':0};
gfd = [];
gfd['celsData'] = [["00:00",0]];
gfd['humdData'] = [["00:00",0]];
graphData = [gfd['celsData'],gfd['humdData']];
targetLine = [];
targetLine['setcelsius'] = 0;
targetLine['sethumidity'] = 0;
var maxPlot = 60;
var realtime_flg = true,
      pictureShow = true,
      rangeBtnable = [];
      

param1 = {
        min:0,
        max:40,
        fgColor:'#ED5D5C',
        bgColor:'#E6E4DF',
        inputColor:'#323A45',
        thickness:'.1',
        readOnly:true,
        displayInput:false
    };
    
    param2 = {
        min:0,
        max:80,
        fgColor:'#98D1CD',
        bgColor:'#E6E4DF',
        inputColor:'#323A45',
        thickness:'.1',
        readOnly:true,
        displayInput:false
    };

options = {
        title : 'LINEデータ',
        series:stackLabel,
        seriesColors:stackColor,
        legend:{
           show:true,
           location:'ne'
        },
        cursor:{
           show:true,
           zoom:true
        },
        highlighter:{
           show:true,
           sizeAdjust:15
        },
        axes : {
          xaxis : {
            label : '時刻',
            renderer : $.jqplot.DateAxisRenderer,
            tickOptions : {
              formatString : '%H:%M'
            },
            //min : '00:00',
            tickInterval : '10 minute' // メモリ間隔は1h
          },
          yaxis : {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            label : '温度・湿度'
            
          }
        },
        seriesDefaults:{
           shadow:false,
           markerOptions:{
               shadow:false
           },
           pointLabels:{
               show:true,
               location:'nw'
           }
        },
        grid:{
            background:'#ffffff',
            shadow:false
        },
        canvasOverlay:{
            show:true,
            objects:[
                {
                    dashedHorizontalLine: {
                        y:targetLine['setcelsius'],
                        lineWidth:2,
                        color:'#ffc0c0'                
                    }
                },
                {
                    dashedHorizontalLine:{
                        y:targetLine['sethumidity'],
                        linrWidth:2,
                        color:'#8080ff'
                    }
                }
            ]
        }
    };  

$(document).ready(function() {
    $('.simple-menu').sidr();   
    plot = $.jqplot('lineChart', graphData, options);
    //最初の描画をしたら初期化
    gfd['celsData'] = [];
    gfd['humdData'] = [];  
    window.onresize = function(event){
       replot(); 
    };
    $('#dial1').knob(param1);
    setknobLabel(1);
    $('#dial2').knob(param2);
    setknobLabel(2);
    
    $('#pictureModal').on('shown.bs.modal',function(e){
        if(pictureShow){
                $('#showcase').awShowcase({
                    show_caption:'onhover',
                    thumbnails:true
                });
                pictureShow = false;
        }
    });
    
    
    $('#slider1').slider({
        value:10,
          min:0,
          max:35,
          step:1,
          range:"min",
          change:function(event,ui){
              
          },
          slide:function(eve,ui){
             $('#slider1').prev('span').html(ui.value+'℃');
          },
          create:function(ev,ui){
              
          }
    });
    
    $('#slider2').slider({
        value:35,
          min:0,
          max:100,
          step:1,
          range:"min",
          change:function(event,ui){
              
          },
          slide:function(eve,ui){
             $('#slider2').prev('span').html(ui.value+'%');
          },
          create:function(ev,ui){
              
          }
    });
    
   $('#range1').rangeSlider({
       bounds:{min: 15, max: 35},
       arrows:false,
       step:1
   });
   $('#range1').bind("valuesChanging",function(e,data){
       checkSliderPoints(1);
   });
   $('#range2').rangeSlider({
       bounds:{min: 10, max: 100},
       arrows:false,
       step:1
   });
   $('#range2').bind("valuesChanging",function(e,data){
       checkSliderPoints(2);
   });
    
});

$(function(){
    $('#settingBtn').click(function(){
        var setData = {
                lineid:1,
                lineno:1,
                targetCelsius:25,
                targetHumidity:60,
                celsiusMode:'WAIT',
                humidityMode:'WAIT',
                delayCelsius:{top:3,under:3},
                delayhumidity:{top:5,under:5}
             };
          //var rep = ajaxLoading('http://www.vita-factory.com/api/changesetting','post','json',setData);
    });
    
    /*
    $('.checkradio').iCheck({
        radioClass:'iradio_flat-orange'
    });
    */
   //チェックされてるcheckboxの色を変更する & 表示データ切替
    $('#checkbox-item-list :checkbox').click(function(){
        if($(this).prop('checked')){
            $(this).parent('label').addClass('addBackground');
        }else{
            $(this).parent('label').removeClass('addBackground');
        }
        replot();
    });
    
    $('#selectDateBtn').click(function(){
        
        var str1 = $('#datetimepicker1').val(),
              str2 = $('#datetimepicker2').val();
        
        var ut1 = getUnixTime(str1);
        var ut2 = getUnixTime(str2);
        if(!isNaN(ut1) && !isNaN(ut2)){
            realtime_flg = false;
            options.axes.xaxis.tickInterval = '1 hour';
            var setData = {
               lineid:1,
               lineno:1,
               start:ut1+32400,
               end:ut2+32400
            };
            gfd['celsData'] = [];
            gfd['humdData'] = [];  
            var doc = $('#lineRecordTable > tbody');
            var rep = ajaxLoading('http://www.vita-factory.com/api/getRecordData','post','json',setData);
            rep.forEach(function(v){
                setPlot({
                    celsius:v.celsius,
                    humidity:v.humidity,
                    t_date:v.t_date-32400
                });
                doc.append(
                        $('<tr></tr>')
                            .append($('<td></td>').text(computeDuration(v.t_date)))
                            .append($('<td></td>').text(v.celsius))
                            .append($('<td></td>').text((v.celsius))
                            .append($('<td></td>').text(v.humidity))   
                            .append($('<td></td>').text(v.humidity)))
                );
            });
            replot();
        }
    });
    
    $('#realtimeBtn').click(function(){
        realtime_flg = true;
        options.axes.xaxis.tickInterval = '10 minute';
        setGraphData();
        replot();
    });
    
    $('#targetCelsiusBtn').click(function(){
            $('#dial1').trigger('configure',{
                    "max":$('#targetCelsius').val()
           }); 
           $('#dial1').parent('div').find('.stremWrap').find('span').eq(2).text($('#targetCelsius').val());
    });
    
    $('#targetHumidityBtn').click(function(){
        $('#dial2').trigger('configure',{
                    "max":$('#targetHumidity').val()
           }); 
        var d = {
           humidity:$('#targetHumidity').val(),
           targetHumidity:$('#dial2').parent('div').find('.stremWrap').find('span').eq(2).text()
        };
        console.log(d);
        //var rep = ajaxLoading('http://www.vita-factory.com/mail/send','post','json',d);
        $('#dial2').parent('div').find('.stremWrap').find('span').eq(2).text($('#targetHumidity').val());
    });
    
    $('#PhotoBtn').click(function(){
        var rep = ajaxLoading('http://www.vita-factory.com/api/getS3Photo','post','json',{'date':'*'});
        console.log(rep);
        var doc = $('#photoul');
        doc.empty();
        for(var i=0; i<rep.length; i++){
            var str = rep[i].key;
            doc.append('<div class="photodiv"><p class="p-c">'+str.substr(3,17)+'</p><li style="list-style-type:none;"><a href="'+rep[i].url+'"><img src="'+rep[i].url+'" /</a></li></div>');
        }
    });
    
    //メール送信する
    $('#mailSendBtn').click(function(){
        var rep = ajaxLoading('http://www.vita-factory.com/mail/send','post','json',{'to':'mmbarion@gmail.com'});
    });
    
    addCheckboxText();
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
        $('#datetimepicker3').datetimepicker({
	addSliderAccess: true,
	sliderAccessArgs: { touchonly: false },
	changeMonth: false,
	changeYear: false,
                  dateFormat:'yy/mm/dd'
        });
        
        $('#datetimepicker4').datetimepicker({
	addSliderAccess: true,
	sliderAccessArgs: { touchonly: false },
	changeMonth: false,
	changeYear: false,
                  dateFormat:'yy/mm/dd'
        });
});

//読み込み完了後
$(window).load(function(){
    var  socket1 = io.connect('/summary');
    socketInit(socket1,{'lineid':1});
    setGraphData();
    replot(); 
    var setData = {
        lineid:1,
        lineno:1
    };
    
    var rep = ajaxLoading('http://www.vita-factory.com/api/getsetting','post','json',setData);
    $('#dial1').parent('div').find('.stremWrap').find('span').eq(2).text(rep.targetCelsius);
    $('#dial2').parent('div').find('.stremWrap').find('span').eq(2).text(rep.targetHumidity);
    $('#dial1').trigger('configure',{
         "max":rep.targetCelsius
    }); 
    $('#dial2').trigger('configure',{
          "max":rep.targetHumidity
     });
     
     $('#slider1').slider('value',rep.targetCelsius);
     $('#slider2').slider('value',rep.targetHumidity);
     $('#slider1').prev('span.slider-span').html(rep.targetCelsius+'℃');
     $('#slider2').prev('span.slider-span').html(rep.targetHumidity+'%');
    
    targetLine['setcelsius'] = rep.targetCelsius;
    targetLine['sethumidity'] = rep.targetHumidity;
    replot();
    var rep = ajaxLoading('http://www.vita-factory.com/api/getUsers','post','json',{flg:'select'});
    setUserlist(rep);
    /*
    $('#showcase').awShowcase({
        content_width:700,
        content_height:470,
        interval:3000,
        btn_numbers:true,
        keybord_keys:true,
        transition:'vslide',
        show_caption:  'onhover',
        thumbnails:  true,
        thumbnails_position:  'outside-last',
        thumbnails_slidex:  0,
        speed_change:  true
    });
    */
   
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
         if(realtime_flg){
                $('#dial1').parent('div').find('.stremWrap').find('span').eq(0).text(obj.celsius);
                $('#dial2').parent('div').find('.stremWrap').find('span').eq(0).text(obj.humidity);
                setPlot({celsius:obj.celsius,
                               humidity:obj.humidity,
                               t_date:obj.t_date
                   });
                   replot();
                   
        }
        $('#line1logTable > tbody').append(
                        $('<tr></tr>')
                            .append($('<td></td>').text(computeDuration(obj.t_date)))
                            .append($('<td></td>').text(obj.celsius))
                            .append($('<td></td>').text(obj.humidity)
                        )      
                     );
        changeKnobValue($('#dial1'),obj.celsius,'celsius');
        changeKnobValue($('#dial2'),obj.humidity,'humidity');
     });
     
     socket.on('changesetting',function(obj){
            console.log('socket changesetting');
            console.log(obj);
            $('#dial1').trigger('configure',{
                "max":obj.targetCelsius
            }); 
            $('#dial2').trigger('configure',{
                "max":obj.targetHumidity
            }); 
     });
     
     socket.on('disconnect',function(){
         console.log('socket disconnect.');
         if($('#info-progress.progress-bar').hasClass('progress-bar-success')){
                $('#info-progress.progress-bar').removeClass('progress-bar-success').addClass('progress-bar-warning');
                 $('#info_p').text('\u00a0サーバーと再接続中...');
         };
     });
}

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

function changeKnobValue(doc,newValue,label){
    
    $({value:prevPoints[label]}).animate({value:newValue},{
              duration:1200,
              easing:'swing',
              step:function(){
                  doc.val(this.value).trigger('change');
                  prevPoints[label] = newValue;
              }
    });
}

//knob中心部にlabelをセット
function setknobLabel(knobno){
    $('#dial'+knobno).parent('div')
            .append('<div class="labelWrap"></div>').find('.labelWrap')
            .append('<span>現在値</span><span>&nbsp/&nbsp</span><span>設定値</span>');
    var doc = $('#dial'+knobno).parent('div')
            .append('<div class="stremWrap"></div>').find('.stremWrap')
            .append('<span>***</span><span style="color:#E6E4DF">&nbsp/&nbsp</span><span>***</span>');
    if (knobno === 1){
        doc.append('<span class="glyphicon glyphicon-fire"></span>');
    }else{
        doc.append('<span class="glyphicon glyphicon-tint"></span>');
    }
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

//グラフ再描画
function replot(){
            if(plot){
                plot.destroy();
            }
            checkGraphData();
            
            plot = $.jqplot('lineChart', graphData, options);   
};

//グラフ用データ配列への追加を行う
function setPlot(params){
    if(params){
            var nowt = computeDurationTime(parseInt(params.t_date));
            if(realtime_flg){
                if(gfd['celsData'].length >= maxPlot) {
                    gfd['celsData'].shift();
                    gfd['humdData'].shift();
                } 
            }else{
                if(gfd['celsData'].length >= 100) {
                    gfd['celsData'].shift();
                    gfd['humdData'].shift();
                } 
            }
        
            gfd['celsData'].push([nowt,(1*params.celsius)]);
            gfd['humdData'].push([nowt,(1*params.humidity)]);
            graphData = [gfd['celsData'],gfd['humdData']];
    }  
};

//サーバから取得したデータをグラフ用にしてセットする
function setGraphData(){
    var setData = {
        lineid:1,
        lineno:1,
        pubdate:nowD()
    };
    gfd['celsData'] = [];
    gfd['humdData'] = [];
    var rep = ajaxLoading('http://www.vita-factory.com/api/getchart','post','json',setData);
    rep.forEach(function(v){
        setPlot({
            celsius:v.celsius,
            humidity:v.humidity,
            t_date:v.t_date
        });
    });
    //var obj = ajaxLoading('http://www.vita-factory.com/api/getchart','post','json',{lineid:lineid,lineno:1});
    //console.log(obj);
    /*
    if(obj){
        var wk;
        for(var i =0; i<obj.length; i++){
            wk = JSON.parse(obj[i]);
            setPlot({celsius:wk.celsius,
                            humidity:wk.humidity,
                            t_date:wk.t_date
            });
        }
    }
    */
};

//checkboxの状態を見て表示すべきグラフデータを作成する
function checkGraphData(){
    var wk_chkbox = $('#checkbox-item-list :checkbox');
    var str;
    var nary = [],
          ncolor = [],
          nlabel = [],
          ntargetLine = {setcelsius:0,sethumidity:0};
          
    for(var i =0; i<wk_chkbox.length; i++){
         if(wk_chkbox[i].checked){
             str = wk_chkbox[i].name;
             nary.push(gfd[str]);
             ncolor.push(sColors[str]);
             nlabel.push(sLabels[str]);
             if(str == 'setcelsius' || str == 'sethumidity'){
                 ntargetLine[str] = targetLine[str]
             }
         }
    }

    //グラフオプションを再設定
    options.series = nlabel;
    options.seriesColors = ncolor;
    options.canvasOverlay.objects[0].dashedHorizontalLine.y = ntargetLine.setcelsius;
    options.canvasOverlay.objects[1].dashedHorizontalLine.y = ntargetLine.sethumidity;
    graphData = nary;
};

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

function addCheckboxText(){
    $('#inlineCheckbox1').after('<span>温度</span>');
    $('#inlineCheckbox2').after('<span>湿度</span>');
    $('#inlineCheckbox3').after('<span>設定温度</span>');
    $('#inlineCheckbox4').after('<span>設定湿度</span>');
    $('#inlineCheckbox5').after('<span>温度UP</span>');
    $('#inlineCheckbox6').after('<span>温度DW</span>');
    $('#inlineCheckbox7').after('<span>湿度UP</span>');
    $('#inlineCheckbox8').after('<span>湿度DW</span>');
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