$(function(){
	var d_cels = [];//温度グラフデータ
	var d_humd = [];//湿度グラフデータ
	var totalPoints = 50;//グラフに表示される点の最大数
	var dataset;
	
	//グラフの基本設定
	var chart_option = {
		series: { shadowSize:0,lines:{show:true},points:{show:true}},
       grid:{clickable:true,hoverable:true,backgroundColor:"#333333",borderColor:"#222222"},
       yaxis: {min:0,max:80,tickColor:"#444444",font:{size:15,color:"#333333"}},
       legend:{show:true,position:"nw"},
       xaxis: {ticks:5, show: true, mode: "time", timeformat: "%Y/%m/%d %H:%M:%S",tickColor:"#444444"}
	};
	
	//日付選択用グラフを描画
	if($("#select_d").hasClass("active")){
		$.plot($("#selectchart"),[d_cels,d_humd],chart_option);
	}
	
	//WebSocketの使用準備
	var ws = new WebSocket("ws://www.vita-factory.com/ws");
	ws.onopen = function(){
   		console.log('ws_open_on_js');   
	};
	ws.onmessage = function(evt){
		var cont = JSON.parse(evt.data);//json文字列からオブジェクトに変換
		console.log(cont);
		if(typeof cont.celsius != undefined) {
			update_chart([(cont.celsius-0),(cont.humidity-0)]);
		}
	};
	ws.onclose = function(){
		console.log('ws_close_on_js');
	};
	
    //グラフデータのセット&表示の更新
    function update_chart(value){
        if(d_cels.length > totalPoints){
            d_cels = d_cels.slice(1);
        }
        if(d_humd.length > totalPoints){
        	d_humd = d_humd.slice(1);
        }
        var t = (new Date()).getTime();
        t += 32400000;
        d_cels.push([t,value[0]]);
        d_humd.push([t,value[1]]);
        dataset = [
        	{label:"温度",data:d_cels,color:"#FF5454"},
        	{label:"湿度",data:d_humd,color:"#8080ff"}	
         ];
         if($("#realtime").hasClass("active")){
        	 $.plot($("#chart_cels"),dataset,chart_option);
          }
    }	
    
    //選択タブを再描画
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {	
  		if(e.target.hash === "#realtime"){
  			$.plot($("#chart_cels"),dataset,chart_option);
  		}
	});
	
	//データタイムピッカー
	$('#datetimepicker1').datetimepicker({
            addSliderAccess: true,
            sliderAccessArgs: { touchonly: false },
            changeMonth: false,
            changeYear: false
      });
      
      $('#datetimepicker2').datetimepicker({
            addSliderAccess: true,
            sliderAccessArgs: { touchonly: false },
            changeMonth: false,
            changeYear: false
      });
      
      //グラフ用データ取得
      $('#chartBtn').click(function(){
      	$.ajax({
             url: '/api/getchart',
             type: "POST",
             dataType:'json',
             data:{
             	  start:$('#datetimepicker1').val(),
             	  end:$('#datetimepicker2').val()
               },                 
             timeout: 20000,
               //送信前
             beforeSend:function(xhr,settings) {},
               //応答後
             complete: function(xhr,textStatus) {},
               //通信成功時の処理
             success:function(result,textStatus,xhr) {
               	var len = result.length;
               	var ary1 = [];
               	var ary2 = [];
        			var dead1 = [];
        			//デッドラインを引くために頭とケツの日付を取得しておく
        			if(len > 0){
        				dead1.push([JSON.parse(result[0]).date.$date,70]);
        				dead1.push([JSON.parse(result[len-1]).date.$date,70]);
        			}
               	for(var i=0; i<len; i++){
               		ary1.push([
               				JSON.parse(result[i]).date.$date,
               				JSON.parse(result[i]).celsius
               				]);
        				ary2.push([
               				JSON.parse(result[i]).date.$date,
               				JSON.parse(result[i]).humidity
               				]);
               		}
               	var dss = [
        				{label:"温度",data:ary1,color:"#FF5454"},
        				{label:"湿度",data:ary2,color:"#8080ff"},
        				{label:"上限値",data:dead1,color:"#e000e0"}	
         			];
         			
         			$.plot($("#selectchart"),dss,chart_option);
               },
               //失敗時の処理
             error:function(xhr, textStatus, error) {
                alert('通信失敗');
               }
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
    	var data = new Date(ms-32400000);
    	var hh = toDoubleDigits(data.getHours());
    	var mm = toDoubleDigits(data.getMinutes());
    	var ss = toDoubleDigits(data.getSeconds());
  
    	return hh+':'+mm+':'+ss;
	}

});