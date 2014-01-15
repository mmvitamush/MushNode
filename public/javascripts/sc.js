var socket1;
var lineId,celsData,humdData,graphData,plot;
$(document).ready(function() {
    var url = document.URL;
    lineId = url.split('/')[4];
 
     //graphData = [[["01:00",34],["01:10",78],["01:20",90],["01:30",12],["01:40",45],["01:50",67],["02:00",89],["02:10",23],["02:20",56]],
     //   [["01:00",34],["01:10",78],["01:20",90],["01:30",12],["01:40",45],["01:50",67],["02:00",89],["02:10",23],["02:20",56]]];
    celsData = [["00:00",0]];
    humdData = [["00:00",0]];
    graphData = [celsData,humdData]; 
    labels = [{label:" 温度"}, {label:"湿度"}];
    
     options = {
        title : 'LINE:'+lineId,
        series:labels,
        seriesColors:['#ff0000','#0000ff'],
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
        grid:{
            background:'#f1f1f1;'
        }
    };
    
    plot = $.jqplot('lineChart', graphData, options);
    //最初の描画をしたら初期化
    celsData = [];
    humdData = [];
    //レスポンシブ対応
    window.onresize = function(event){
       plot.replot(); 
    };
});

$(function(){
    //socket1 = io.connect('http://www.vita-factory.com/line/'+lineId+'?id='+lineId);
    socket1 = io.connect('/line'+'?lineid='+lineId);
    
    //socket1.emit('login',{user:'sc.js'});
    socket1.on('connect',function(){
        socket1.emit('clientConnect','LINEID:'+lineId+'.send');
    });
    
    //サーバーからのセンサー値配信を受信したのでグラフに描画
    socket1.on('roomto',function(params){
            console.log(params);
            var nowt = computeDuration(parseInt((new Date)/1000));
            celsData.push([nowt,(1*params.celsius)]);
            humdData.push([nowt,(1*params.humidity)]);
            graphData = [celsData,humdData];
            //グラフ再描画
            if(plot){
                plot.destroy();
            }
            plot = $.jqplot('lineChart', graphData, options);
    });
    
});

//日時の０埋め
function toDoubleDigits(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};
	
//ミリ秒を時分秒へ変換
function computeDuration(ms){
    //var data = new Date(ms-32400000);
    var data = new Date(ms*1000);
    var hh = toDoubleDigits(data.getHours());
    var mm = toDoubleDigits(data.getMinutes());
    //var ss = toDoubleDigits(data.getSeconds());
  
    //return hh+':'+mm+':'+ss;
    return hh+':'+mm;
}