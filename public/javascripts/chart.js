$(function(){
var ws = new WebSocket("ws://192.168.56.2:5000/ws");
ws.onopen = function(){
   console.log('ws_open_on_js');
   
};
ws.onmessage = function(evt){
	console.log(evt.data);
};
ws.onclose = function(){
	console.log('ws_close_on_js');
};


  var chartdata2 = {

  "config": {
  	"width":850,
    "title": "WebSocket Line Chart",
    "type": "line",
    "useMarker":"css-ring",
    "lineWidth": 3,
    "borderWidth":4,
    "markerWidth":15,
    "useShadow":"no",
    "useVal":"yes",
    "maxWsColLen":30,
    "colorSet": 
          ["red","#FF9114","#3CB000","#00A8A2","#0036C0","#C328FF","#FF34C0"],
    "bgGradient": {
            "direction":"vertical",
            "from":"#687478",
            "to":"#222222"
     },
      "xLines": [
          {"val":1000,"color":"rgba(200,200,200,0.8)","width":"4"
          }
        ] 
  },
  
  "data": [
    ["日時"],
    ["温度(℃)"],
    ["湿度(％)"]
  ]
};

var extend = ccchart.util.cnExtend;
ccchart.wsCloseAll();
ccchart.init('chart1', chartdata2)
.ws('ws://192.168.56.2:5000/ws')
.on('message',function(){
	console.log('chart_socket');
});


$('#chart_button').click(function(){
               $.ajax({
                        url: '/api/getchart',
                        type: "POST",
                        dataType:'json',                 
                        timeout: 20000,
                        //送信前
                        beforeSend:function(xhr,settings) {
                                
                        },
                        //応答後
                        complete: function(xhr,textStatus) {
                                
                        },
                        //通信成功時の処理
                        success:function(result,textStatus,xhr) {
                        		console.log(result);
                        		var len = result.length;
                        		var ary1 = [];
                        		var ary2 = [];
                        		var ary3 = [];
                        		ary1.push("時間");
                        		ary2.push("温度(℃)");
                        		ary3.push("湿度(％)");
                        		
                        		for(var i=0; i<len; i++){
                        			ary1.push(computeDuration(JSON.parse(result[i]).date.$date));
                        			ary2.push(JSON.parse(result[i]).celsius);
                        			ary3.push(JSON.parse(result[i]).humidity);
                        		}
                        		
                        	var chartdata2 = {

							  "config": {
							  	"width":960,
							    "title": "Line Chart",
							    "subTitle": "Canvasを使ったシンプルなラインチャートです",
							    "type": "line",
							    "useMarker":"css-ring",
							    "lineWidth": 3,
							    "borderWidth":4,
							    "markerWidth":15,
							    "useShadow":"no",
							    "useVal":"yes",
							    "colorSet": 
							          ["#FF9114","#00A8A2"],
							    "bgGradient": {
							            "direction":"vertical",
							            "from":"#687478",
							            "to":"#222222"
							     },
							      "xLines": [
							          {"val":50,"color":"rgba(200,200,200,0.8)","width":"4"
							          }
							        ] 
							  },
							  
							  "data": [
							    ary1,
							    ary2,
							    ary3
							  ]
							};
						ccchart.init('chart1', chartdata2)
                        		
                        },
                        //失敗時の処理
                        error:function(xhr, textStatus, error) {
                              alert('NG');
                        }
               });
        });
function computeDuration(ms){
    var data = new Date(ms-32400000);
    var h = data.getHours();
    var m = data.getMinutes();
    var s = data.getSeconds();
  
    return h+':'+m+':'+s;
}   

});