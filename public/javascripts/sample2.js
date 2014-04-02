var param1,param2,lineid,lineno,graphData,graphData2,plot,plot2,gfd,gfd2,options,targetLine;
var sColors = {
   celsData:'#ED5D5C',
   humdData:'#98D1CD',
   ventData:'#FFD464',
   co2Data:'#5133AB',
   setcelsius:'#ffc0c0',
   sethumidity:'#8080ff',
   setventilation:'#FBA848',
   setco2:'#8C0095',
   celsiusup:'#ED5D5C',
   humidityup:'#98D1CD',
   ventilationdw:'#FFD464',
   co2dw:'#5133AB'
},
sLabels = {
   celsData:{label:'温度'},
   humdData:{label:'湿度'},
   ventData:{label:'換気'},
   co2Data:{label:'CO2'},
   setcelsius:{label:'温度範囲'},
   sethumidity:{label:'湿度範囲'},
   setventilation:{label:'換気範囲'},
   setco2:{label:'CO2範囲'},
   celsiusup:{label:'温度リレー',markerOptions:{size:21},showLine: false},
   humidityup:{label:'湿度リレー',markerOptions:{size:21},showLine: false},
   ventilationdw:{label:'換気リレー',markerOptions:{size:21},showLine: false},
   co2dw:{label:'CO2リレー',markerOptions:{size:21},showLine: false}
};

sTargets = {
    setcelsius_top:{
         dashedHorizontalLine: {
                y:0,
                lineWidth:2,
                color:'#ED5D5C'                
         }
    },
    setcelsius_bottom:{
         dashedHorizontalLine: {
                y:0,
                lineWidth:2,
                color:'#ED5D5C'                
         }
    },
    sethumidity_top:{
        dashedHorizontalLine:{
               y:0,
               linrWidth:2,
               color:'#98D1CD'
        }
    },
    sethumidity_bottom:{
        dashedHorizontalLine:{
               y:0,
               linrWidth:2,
               color:'#98D1CD'
        }
    },
    setventilation_top:{
        dashedHorizontalLine:{
                y:0,
                linrWidth:2,
                color:'#FFD464'
        }       
    },
    setventilation_bottom:{
        dashedHorizontalLine:{
                y:0,
                linrWidth:2,
                color:'#FFD464'
        }       
    },
    setco2_top:{
       dashedHorizontalLine:{
               y:0,
               linrWidth:2,
               color:'#5133AB'
       }        
    },
    setco2_bottom:{
       dashedHorizontalLine:{
               y:0,
               linrWidth:2,
               color:'#5133AB'
       }        
    }
};

//初期値のセット
var stackColor = [sColors.celsData,sColors.humdData,sColors.ventData,sColors.co2Data],
       stackLabel = [sLabels.celsData,sLabels.humdData,sLabels.ventData,sLabels.co2Data],
       prevPoints = {'celsius':0,'humidity':0,'ventilation':0,'co2':0};
//リアルタイム用配列と選択日時配列に分割することにした
gfd = [];
gfd['celsData'] = [["00:00",0]];
gfd['humdData'] = [["00:00",0]];
gfd['ventData'] = [["00:00",0]];
gfd['co2Data'] = [["00:00",0]];
//リレー状態のためのデータ(線無し、点デカめ)
gfd['celsiusup'] = [];
gfd['humidityup'] = [];
gfd['ventilationdw'] = [];
gfd['co2dw'] = [];

//選択日時用配列を定義
gfd2 = [];
gfd2['celsData'] = [];
gfd2['humdData'] = [];
gfd2['ventData'] = [];
gfd2['co2Data'] = [];
//リレー状態のためのデータ(線無し、点デカめ)
gfd2['celsiusup'] = [];
gfd2['humidityup'] = [];
gfd2['ventilationdw'] = [];
gfd2['co2dw'] = [];

graphData = [gfd['celsData'],gfd['humdData'],gfd['ventData'],gfd['co2Data']];
graphData2 = [gfd2['celsData'],gfd2['humdData'],gfd2['ventData'],gfd2['co2Data']];

var maxPlot = 60;
var realtime_flg = true,
      pictureShow = true,
      rangeBtnable = [];
      
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
            show:true

        }
    };  

$(document).ready(function() {
    var url = document.URL;
    lineid = url.split('/')[4];
    lineno = url.split('/')[5];
    $('.simple-menu').sidr();   
    plot = $.jqplot('lineChart', graphData, options);
    //plot2 = $.jqplot('lineChart', graphData2, options);
    //最初の描画をしたら初期化
    gfd['celsData'] = [];
    gfd['humdData'] = [];  
    gfd['ventData'] = [];
    gfd['co2Data'] = [];

    window.onresize = function(event){
       replot(); 
    };
    
    $('#pictureModal').on('shown.bs.modal',function(e){
        if(pictureShow){
                $('#showcase').awShowcase({
                    show_caption:'onhover',
                    thumbnails:true
                });
                pictureShow = false;
        }
    });
    
});

$(function(){
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
               lineid:lineid,
               lineno:lineno,
               start:ut1+32400,
               end:ut2+32400
            };
            /*
            gfd['celsData'] = [];
            gfd['humdData'] = [];  
            gfd['ventData'] = [];
            gfd['co2Data'] = [];
            */
            gfd2['celsData'] = [];
            gfd2['humdData'] = [];  
            gfd2['ventData'] = [];
            gfd2['co2Data'] = [];
            
            var doc = $('#lineRecordTable > tbody');
            var rep = ajaxLoading('http://www.vita-factory.com/api/getRecordData','post','json',setData);
            rep.forEach(function(v){
                setPlot({
                    celsius:v.celsius,
                    humidity:v.humidity,
                    ventilation:v.ventilation,
                    co2:v.co2,
                    t_date:v.t_date-32400,
                    relay1:v.relay1,
                    relay2:v.relay2,
                    relay3:v.relay3,
                    relay4:v.relay4
                });
                create_graphData();
                doc.append(
                        $('<tr></tr>')
                            .append($('<td />').text(computeDuration(v.t_date-32400)))
                            .append($('<td style="background:#EEE;" />').text(v.celsius))
                            .append($('<td style="background:#EEE;" />').text(v.top_range1+' ～ '+v.bottom_range1))
                            .append($('<td style="background:#EEE;" />').text(chkOver(v.relay1)))
                            .append($('<td style="background:#EEE;" />').text(v.vent_value1))
                            .append($('<td />').text(v.humidity))   
                            .append($('<td />').text(v.top_range2+' ～ '+v.bottom_range2))
                            .append($('<td />').text(chkOver(v.relay2)))
                            .append($('<td />').text(v.vent_value2)) 
                            .append($('<td style="background:#EEE;" />').text(v.co2))   
                            .append($('<td style="background:#EEE;" />').text(v.top_range4+' ～ '+v.bottom_range4))
                            .append($('<td style="background:#EEE;" />').text(chkOver(v.relay4)))
                            .append($('<td style="background:#EEE;" />').text(v.vent_value4))  
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
    
    $('#cacheDeleteBtn').click(function(){
        var rep = ajaxLoading('http://www.vita-factory.com/api/deletecache','post','json',{lineid:lineid,lineno:lineno});
        setGraphData();
        replot(); 
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
    socketInit(socket1,{'lineid':lineid});
    setGraphData();
    replot(); 
    var setData = {
        lineid:lineid,
        lineno:lineno
    };
    
    var rep = ajaxLoading('http://www.vita-factory.com/api/getsetting','post','json',setData);
    if(rep){
        setKnobValues(rep);
        replot();
    }
    var rep = ajaxLoading('http://www.vita-factory.com/api/getUsers','post','json',{flg:'select'});
    setUserlist(rep);
    
    $('#allsettingButton').click(function(){
        $('#settingModal').modal('toggle');
    });
    
    $('#allpictureButton').click(function(){
        $('#pictureModal').modal('toggle');
    });
    
    $('#alllineButton').click(function(){
        $('#lineModal').modal();
    });    
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
         if((obj.lineid == lineid) && (obj.lineno == lineno)){
                console.log(obj); 
               setKnobValues(obj);
               if(realtime_flg){
                       setPlot({celsius:obj.celsius,
                                      humidity:obj.humidity,
                                      ventilation:obj.ventilation,
                                      co2:obj.co2,
                                      t_date:obj.t_date,
                                      relay1:obj.relay1,
                                      relay2:obj.relay2,
                                      relay3:obj.relay3,
                                      relay4:obj.relay4
                          });
                          create_graphData();
                          replot();
               }
               $('#celsius_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.celsius))
                                   .append($('<td />').text(obj.top_range1+' ～ '+obj.bottom_range1))
                                   .append($('<td />').text(chkOver(obj.relay1)))
                                   .append($('<td />').text(obj.vent_value1))
                            );
                    
               $('#humidity_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.humidity))
                                   .append($('<td />').text(obj.top_range2+' ～ '+obj.bottom_range2))
                                   .append($('<td />').text(chkOver(obj.relay2)))
                                   .append($('<td />').text(obj.vent_value2))
                            );
                    
               $('#co2_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.co2))
                                   .append($('<td />').text(obj.top_range4+' ～ '+obj.bottom_range4))
                                   .append($('<td />').text(chkOver(obj.relay4)))
                                   .append($('<td />').text(obj.vent_value4))
                            );
          }
          changeAllLineValues(obj);
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

function changeAllLineValues(obj) {
    var eml = $('#al'+obj.lineid+'-'+obj.lineno);
    var record = eml.children('.wrapAllLine1').find('.text_wrap').find('ul li');
    var schedule = eml.find('.wrapAllLine2 ');
    record.eq(0).find('span').html('温度: '+obj.celsius +' '+ chkOver(obj.relay1));
    record.eq(1).find('span').html('湿度: '+obj.humidity +' '+ chkOver(obj.relay2));
    record.eq(2).find('span').html('換気: '+obj.ventilation +' '+ chkOver(obj.relay3));
    record.eq(3).find('span').html('CO2: '+obj.co2 +' '+ chkOver(obj.relay4));
    
};

function setKnobValues(rep){
    var doc1 = $('#dial1table > tbody > tr > td');
    doc1.eq(0).text(rep.celsius);
    doc1.eq(1).text(rep.top_range1);
    doc1.eq(2).text(rep.bottom_range1);
    doc1.eq(3).text(chkOver(rep.relay1));
    doc1.eq(4).text(rep.vent_value1);
    
    var doc2 = $('#dial2table > tbody > tr > td');
    doc2.eq(0).text(rep.humidity);
    doc2.eq(1).text(rep.top_range2);
    doc2.eq(2).text(rep.bottom_range2);
    doc2.eq(3).text(chkOver(rep.relay2));
    doc2.eq(4).text(rep.vent_value2);
    
    var doc4 = $('#dial4table > tbody > tr > td');
    doc4.eq(0).text(rep.co2);
    doc4.eq(1).text(rep.top_range4);
    doc4.eq(2).text(rep.bottom_range4);
    doc4.eq(3).text(chkOver(rep.relay4));
    doc4.eq(4).text(rep.vent_value4);
    
    sTargets.setcelsius_top.dashedHorizontalLine.y = rep.top_range1;
    sTargets.setcelsius_bottom.dashedHorizontalLine.y = rep.bottom_range1;
    
    sTargets.sethumidity_top.dashedHorizontalLine.y = rep.top_range2;
    sTargets.sethumidity_bottom.dashedHorizontalLine.y = rep.bottom_range2;
    
    sTargets.setventilation_top.dashedHorizontalLine.y = rep.top_range3;
    sTargets.setventilation_bottom.dashedHorizontalLine.y = rep.bottom_range3;
    
    sTargets.setco2_top.dashedHorizontalLine.y = rep.top_range4;
    sTargets.setco2_bottom.dashedHorizontalLine.y = rep.bottom_range4;    
};

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
            if(realtime_flg){
                //リアルタイムデータを描画
                if(graphData[0].length > 0){
                    plot = $.jqplot('lineChart', graphData, options);
                }
            } else {
                //選択日時データを描画
                if(graphData2[0].length > 0){
                    plot = $.jqplot('lineChart', graphData2, options);
                }
            }
};

//グラフ用データ配列への追加を行う
function setPlot(params){
    if(params){
            var nowt = computeDurationTime(parseInt(params.t_date));
            if(realtime_flg){
                if(gfd['celsData'].length >= maxPlot) {
                    shit_gfd();
                }       
            }else{
                if(gfd2['celsData'].length >= 100) {
                    shit_gfd();
                } 
            }
            if(realtime_flg){
                    gfd['celsData'].push([nowt,(1*params.celsius)]);
                    gfd['humdData'].push([nowt,(1*params.humidity)]);
                    gfd['ventData'].push([nowt,(1*params.ventilation)]);
                    gfd['co2Data'].push([nowt,(1*params.co2)]);

                    if(params.relay1 === 1){gfd['celsiusup'].push([nowt,(1*params.celsius)]);}
                    if(params.relay2 === 1){gfd['humidityup'].push([nowt,(1*params.humidity)]);}
                    if(params.relay3 === 1){gfd['ventilationdw'].push([nowt,(1*params.ventilation)]);}
                    if(params.relay4 === 1){gfd['co2dw'].push([nowt,(1*params.co2)]);}
           } else {
                    gfd2['celsData'].push([nowt,(1*params.celsius)]);
                    gfd2['humdData'].push([nowt,(1*params.humidity)]);
                    gfd2['ventData'].push([nowt,(1*params.ventilation)]);
                    gfd2['co2Data'].push([nowt,(1*params.co2)]);

                    if(params.relay1 === 1){gfd2['celsiusup'].push([nowt,(1*params.celsius)]);}
                    if(params.relay2 === 1){gfd2['humidityup'].push([nowt,(1*params.humidity)]);}
                    if(params.relay3 === 1){gfd2['ventilationdw'].push([nowt,(1*params.ventilation)]);}
                    if(params.relay4 === 1){gfd2['co2dw'].push([nowt,(1*params.co2)]);}            
           }
    }  
};

//サーバから取得したデータをグラフ用にしてセットする
function setGraphData(){
    var setData = {
        lineid:lineid,
        lineno:lineno,
        pubdate:nowD()
    };
    if(realtime_flg){
            gfd['celsData'] = [];
            gfd['humdData'] = [];
            gfd['ventData'] = [];
            gfd['co2Data'] = [];

            gfd['celsiusup'] = [];
            gfd['humidityup'] = [];
            gfd['ventilationdw'] = [];
            gfd['co2dw'] = [];
    } else {
            gfd2['celsData'] = [];
            gfd2['humdData'] = [];
            gfd2['ventData'] = [];
            gfd2['co2Data'] = [];

            gfd2['celsiusup'] = [];
            gfd2['humidityup'] = [];
            gfd2['ventilationdw'] = [];
            gfd2['co2dw'] = [];        
    }
    var rep = ajaxLoading('http://www.vita-factory.com/api/getchart','post','json',setData);
    if(rep){
            $('#celsius_rt_LogTable > tbody').empty();
            $('#humidity_rt_LogTable > tbody').empty();    
            $('#co2_rt_LogTable > tbody').empty();
            rep.forEach(function(v){
                setPlot({
                    celsius:v.celsius,
                    humidity:v.humidity,
                    ventilation:v.ventilation,
                    co2:v.co2,
                    t_date:v.t_date,
                    relay1:v.relay1,
                    relay2:v.relay2,
                    relay3:v.relay3,
                    relay4:v.relay4
                });
                set_realtime_log(v);
            });
            }
    create_graphData();
};


function create_graphData(){
    if(realtime_flg){
            graphData = [];
            if(gfd['celsData'].length !== 0){ graphData.push(gfd['celsData']); }
            if(gfd['humdData'].length !== 0){ graphData.push(gfd['humdData']); }
            if(gfd['ventData'].length !== 0){ graphData.push(gfd['ventData']); }
            if(gfd['co2Data'].length !== 0){ graphData.push(gfd['co2Data']); }
            if(gfd['celsiusup'].length !== 0){ graphData.push(gfd['celsiusup']); }
            if(gfd['humidityup'].length !== 0){ graphData.push(gfd['humidityup']); }
            if(gfd['ventilationdw'].length !== 0){ graphData.push(gfd['ventilationdw']); }
            if(gfd['co2dw'].length !== 0){ graphData.push(gfd['co2dw']); }
    } else {
            graphData2 = [];
            if(gfd2['celsData'].length !== 0){ graphData2.push(gfd2['celsData']); }
            if(gfd2['humdData'].length !== 0){ graphData2.push(gfd2['humdData']); }
            if(gfd2['ventData'].length !== 0){ graphData2.push(gfd2['ventData']); }
            if(gfd2['co2Data'].length !== 0){ graphData2.push(gfd2['co2Data']); }
            if(gfd2['celsiusup'].length !== 0){ graphData2.push(gfd2['celsiusup']); }
            if(gfd2['humidityup'].length !== 0){ graphData2.push(gfd2['humidityup']); }
            if(gfd2['ventilationdw'].length !== 0){ graphData2.push(gfd2['ventilationdw']); }
            if(gfd2['co2dw'].length !== 0){ graphData2.push(gfd2['co2dw']); }        
    }
};

//checkboxの状態を見て表示すべきグラフデータを作成する
function checkGraphData(){
    var wk_chkbox = $('#checkbox-item-list :checkbox');
    var str;
    var nary = [],
          ncolor = [],
          nlabel = [],
          ntarget = [];
          
    for(var i =0; i<wk_chkbox.length; i++){
         if(wk_chkbox[i].checked){
             str = wk_chkbox[i].name;
             if(realtime_flg){
                    if(gfd[str] !== void 0){ 
                        nary.push(gfd[str]); 
                        ncolor.push(sColors[str]);
                        nlabel.push(sLabels[str]);
                    }
                    if(sTargets[str+'_top'] !== void 0){ 
                        ntarget.push(sTargets[str+'_top']); 
                    }
                    if(sTargets[str+'_bottom'] !== void 0){ 
                        ntarget.push(sTargets[str+'_bottom']); 
                    }
            } else {
                    if(gfd2[str] !== void 0){ 
                        nary.push(gfd2[str]); 
                        ncolor.push(sColors[str]);
                        nlabel.push(sLabels[str]);
                    }
                    if(sTargets[str+'_top'] !== void 0){ 
                        ntarget.push(sTargets[str+'_top']); 
                    }
                    if(sTargets[str+'_bottom'] !== void 0){ 
                        ntarget.push(sTargets[str+'_bottom']); 
                    }                
            }
         }
    }

    if(realtime_flg){
            //グラフオプションを再設定
            options.series = nlabel;
            options.seriesColors = ncolor;
            options.canvasOverlay.objects = ntarget;
            graphData = nary;
    } else {
            //グラフオプションを再設定
            options.series = nlabel;
            options.seriesColors = ncolor;
            options.canvasOverlay.objects = ntarget;
            graphData2 = nary;        
    }
};

function shit_gfd(){
    if(realtime_flg){
                    if(gfd['celsiusup'].length !== 0){
                        if((gfd['celsData'][0][0] === gfd['celsiusup'][0][0]) && (gfd['celsData'][0][1] === gfd['celsiusup'][0][1])){
                            gfd['celsiusup'].shift();
                        }
                    }
                    if(gfd['humidityup'].length !== 0){
                        if((gfd['humdData'][0][0] === gfd['humidityup'][0][0]) && (gfd['humdData'][0][1] === gfd['humidityup'][0][1])){
                            gfd['humidityup'].shift();
                        }
                    }
                    if(gfd['ventilationdw'].length !== 0){
                        if((gfd['ventData'][0][0] === gfd['ventilationdw'][0][0]) && (gfd['ventData'][0][1] === gfd['ventilationdw'][0][1])){
                            gfd['ventilationdw'].shift();
                        }
                    }
                    if(gfd['co2dw'] !== 0){
                        if((gfd['co2Data'][0][0] === gfd['co2dw'][0][0]) && (gfd['co2Data'][0][1] === gfd['co2dw'][0][1])){
                            gfd['co2dw'].shift();
                        }    
                    }
                    gfd['celsData'].shift();
                    gfd['humdData'].shift();
                    gfd['ventData'].shift();
                    gfd['co2Data'].shift();
  } else {
                    if(gfd2['celsiusup'].length !== 0){
                        if((gfd2['celsData'][0][0] === gfd2['celsiusup'][0][0]) && (gfd2['celsData'][0][1] === gfd2['celsiusup'][0][1])){
                            gfd2['celsiusup'].shift();
                        }
                    }
                    if(gfd2['humidityup'].length !== 0){
                        if((gfd2['humdData'][0][0] === gfd2['humidityup'][0][0]) && (gfd2['humdData'][0][1] === gfd2['humidityup'][0][1])){
                            gfd2['humidityup'].shift();
                        }
                    }
                    if(gfd2['ventilationdw'].length !== 0){
                        if((gfd2['ventData'][0][0] === gfd2['ventilationdw'][0][0]) && (gfd2['ventData'][0][1] === gfd2['ventilationdw'][0][1])){
                            gfd2['ventilationdw'].shift();
                        }
                    }
                    if(gfd2['co2dw'].length !== 0){
                        if((gfd2['co2Data'][0][0] === gfd2['co2dw'][0][0]) && (gfd2['co2Data'][0][1] === gfd2['co2dw'][0][1])){
                            gfd2['co2dw'].shift();
                        }                     
                    }
                    gfd2['celsData'].shift();
                    gfd2['humdData'].shift();
                    gfd2['ventData'].shift();
                    gfd2['co2Data'].shift();                    
  }              
}

function set_realtime_log(obj){
                $('#celsius_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.celsius))
                                   .append($('<td />').text(obj.top_range1+' ～ '+obj.bottom_range1))
                                   .append($('<td />').text(chkOver(obj.relay1)))
                                   .append($('<td />').text(obj.vent_value1))
                            );
 
               $('#humidity_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.humidity))
                                   .append($('<td />').text(obj.top_range2+' ～ '+obj.bottom_range2))
                                   .append($('<td />').text(chkOver(obj.relay2)))
                                   .append($('<td />').text(obj.vent_value2))
                            );
                    
                    
               $('#co2_rt_LogTable > tbody').append(
                               $('<tr></tr>')
                                   .append($('<td />').text(computeDuration(obj.t_date)))
                                   .append($('<td />').text(obj.co2))
                                   .append($('<td />').text(obj.top_range4+' ～ '+obj.bottom_range4))
                                   .append($('<td />').text(chkOver(obj.relay4)))
                                   .append($('<td />').text(obj.vent_value4))
                            );
}

function addCheckboxText(){
    $('#inlineCheckbox1').after('<span>温度</span>');
    $('#inlineCheckbox2').after('<span>湿度</span>');
    $('#inlineCheckbox3').after('<span>換気</span>');
    $('#inlineCheckbox4').after('<span>CO2</span>');
    $('#inlineCheckbox5').after('<span>温度範囲</span>');
    $('#inlineCheckbox6').after('<span>湿度範囲</span>');
    $('#inlineCheckbox7').after('<span>換気範囲</span>');
    $('#inlineCheckbox8').after('<span>CO2範囲</span>');
    $('#inlineCheckbox9').after('<span>温度リレー</span>');
    $('#inlineCheckbox10').after('<span>湿度リレー</span>');
    $('#inlineCheckbox11').after('<span>換気リレー</span>');
    $('#inlineCheckbox12').after('<span>CO2リレー</span>');
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

function chkOver(flg){
    if(parseInt(flg) === 0){
        return "OFF";
    } else {
        return "ON"; 
    }
};