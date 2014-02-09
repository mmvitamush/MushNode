var param1,param2,lineid,graphData,plot,gfd,options;
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
       stackLabel = [sLabels.celsData,sLabels.humdData];
gfd = [];
gfd['celsData'] = [["00:00",0]];
gfd['humdData'] = [["00:00",0]];
graphData = [gfd['celsData'],gfd['humdData']];

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
            tickInterval : '1 hour' // メモリ間隔は1h
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
        }
    };
    

       
$(document).ready(function() {
    $('.simple-menu').sidr();   
});

$(function(){
    param1 = {
        min:0,
        max:40,
        fgColor:'#ED5D5C',
        bgColor:'#E6E4DF',
        inputColor:'#323A45',
        thickness:'.08',
        displayInput:false
    };
    param2 = {
        fgColor:'#98D1CD',
        bgColor:'#E6E4DF',
        inputColor:'#323A45',
        thickness:'.08',
        displayInput:false
    };
    
    $('#dial1').knob(param1);
    $('#dial2').knob(param2);
    setknobLabel(2);
    refknob($('#dial1'),$('#dial2'),{val:27,child:1,color:'#ED5D5C'});
    
    $('.checkradio').iCheck({
        radioClass:'iradio_flat-orange'
    });
    
    $('button[id^="linebtn"]').click(function(){
        var name = $(this).attr('id');
        $('#lineModal').modal('toggle');
        $('#lineModal').on('show.bs.modal',function(e){
             $('#lineModalLabel').text('line'+name.substr(7));
             lineid = name.substr(7);
             resetLabel($('#dial2'));      
        });
        $('#lineModal').on('shown.bs.modal',function(e){
            console.log('shown');
                 setGraphData();
                 replot();
        });
    });
    
     //チェックされてるcheckboxの色を変更する & 表示データ切替
    $('#checkbox-item-list :checkbox').click(function(){
        if($(this).prop('checked')){
            $(this).parent('label').addClass('addBackground');
        }else{
            $(this).parent('label').removeClass('addBackground');
        }
        checkGraphData();
        replot();
    });
    addCheckboxText();
    
});

//読み込み完了後
$(window).load(function(){
    var  socket1 = io.connect('/summary');
    socketInit(socket1,{'lineid':1});
    
    
    //var socket2 = io.connect('/summary');
    //socketInit(socket1,{'lineid':1,'lineno':2});
    
    var obj = ajaxLoading('http://www.vita-factory.com/api/getchart','post','json',{lineid:1,lineno:1});
    if(obj){
        var doc = $('#line1logTable');
         doc.append(
         $('<tr></tr>').append(
         $('<th></th>').text('日時')).append(
         $('<th></th>').text('温度')).append(
         $('<th></th>').text('湿度'))
         );
        for(var i=0; i<obj.length; i++){
            wk = JSON.parse(obj[i]);
            doc.append(
                    $('<tr></tr>')
                    .append($('<td></td>').text(computeDuration(wk.t_date)))
                    .append($('<td></td>').text(wk.celsius))
                    .append($('<td></td>').text(wk.humidity))
            );
        }
    }
});

//knobのval更新＆labelに反映
function refknob(doc,cdoc,params){
    doc.val(params.val).trigger('change');
    var any = cdoc.parent('div').find('.stremWrap').children('span:nth-child('+params.child+')');
    any.text( toDoubleDigits(params.val));
    any.css('color',params.color);
}

//knob中心部にlabelをセット
function setknobLabel(knobno){
    $('#dial'+knobno).parent('div')
            .append('<div class="labelWrap"></div>').find('.labelWrap')
            .append('<span>現在値</span><span>&nbsp/&nbsp</span><span>設定値</span>');
    $('#dial'+knobno).parent('div')
            .append('<div class="stremWrap"></div>').find('.stremWrap')
            .append('<span>***</span><span style="color:#E6E4DF">&nbsp/&nbsp</span><span>***</span><br>')
            .append('<span>***</span><span style="color:#E6E4DF">&nbsp/&nbsp</span><span>***</span>');    
}

function resetLabel(doc){
   var s =  doc.parent('div').children('.stremWrap').children('span');
   s.eq(0).text('***');
   s.eq(2).text('***');
   s.eq(3).text('***');
   s.eq(5).text('***');
}

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
             /*
     socket.on('initialized',function(req){
         console.log('Lineid: '+req.lineid+' 受信準備完了')
     });
     */
     
     //サーバーからredisのpubデータを受け取った
     socket.on('roomto',function(obj){
         console.log(obj);
         if(parseInt(obj.lineno) == 1){
              refknob($('#dial1'),$('#dial2'),{val:obj.celsius,child:1,color:'#ED5D5C'});
              refknob($('#dial2'),$('#dial2'),{val:obj.humidity,child:5,color:'#98D1CD'});
         } else if(parseInt(obj.lineno) == 2){
              refknob($('#dial3'),$('#dial4'),{val:obj.celsius,child:1,color:'#ED5D5C'});
              refknob($('#dial4'),$('#dial4'),{val:obj.humidity,child:5,color:'#98D1CD'});
         }
     });
     
     //
     socket.on('disconnect',function(){
         console.log('socket disconnect.');
         if($('#info-progress.progress-bar').hasClass('progress-bar-success')){
                $('#info-progress.progress-bar').removeClass('progress-bar-success').addClass('progress-bar-warning');
                 $('#info_p').text('\u00a0サーバーと再接続中...');
         };
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

//グラフ再描画
function replot(){
            if(plot){
                plot.destroy();
            }
            plot = $.jqplot('lineChart', graphData, options);   
};

//グラフ用データ配列への追加を行う
function setPlot(params){
    if(params){
            var nowt = computeDuration(parseInt(params.t_date));
            gfd['celsData'].push([nowt,(1*params.celsius)]);
            gfd['humdData'].push([nowt,(1*params.humidity)]);
            graphData = [gfd['celsData'],gfd['humdData']];
    }  
};

//サーバから取得したデータをグラフ用にしてセットする
function setGraphData(){
    var obj = ajaxLoading('http://www.vita-factory.com/api/getchart','post','json',{lineid:lineid,lineno:1});
    console.log(obj);
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
};

//checkboxの状態を見て表示すべきグラフデータを作成する
function checkGraphData(){
    var wk_chkbox = $('#checkbox-item-list :checkbox');
    var str;
    var nary = [],
          ncolor = [],
          nlabel = [];
    for(var i =0; i<wk_chkbox.length; i++){
         if(wk_chkbox[i].checked){
             str = wk_chkbox[i].name;
             nary.push(gfd[str]);
             ncolor.push(sColors[str]);
             nlabel.push(sLabels[str]);
         }
    }
    
    //グラフオプションを再設定
    options.series = nlabel;
    options.seriesColors = ncolor;
    graphData = nary;
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
  
    return Y+':'+M+':'+D+' '+hh+':'+mm+':'+ss;
}