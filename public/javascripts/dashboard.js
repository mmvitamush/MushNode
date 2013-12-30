$(document).ready(function() {
	$('.simple-menu').sidr();
        
});

$(function(){
    var s = io.connect('http://localhost:3000');
        s.on("connect",function(){console.log('s.on Connect');});
        s.on("disconnect",function(){console.log('s.on Disconnect');});
        s.on("greeting",function(data,fn){
            console.log('s.on Greeting');
            var answer = data.message;
            fn(answer);
        });
    $('#chartrefreshBtn').click(function(){
        s.emit("message",'mushroooooom!');
        console.log('chartModalBtnClick');
        
    });
	//ajaxLoading('/api/getlog','POST','json',{start:'',end:''},3);

	//WebSocketの使用準備
	//var ws = new WebSocket("ws://www.vita-factory.com/ws");
	//var ws = new WebSocket("ws://192.168.56.2:8000/ws");

                  var ws = new WebSocket("ws://localhost:3000");
                  console.log(ws.readyState);
	ws.onopen = function(){
   		console.log('ws_open_on_js');   
	};
	ws.onmessage = function(evt){
		if($("#info-progress").hasClass("progress-bar-warning")){
			$(".loadingCH").fadeOut();
			$("#info_p").text("計測器から受信中");
			$("#info_p").prepend("<span></span>");
			$("#info_p").find("span").addClass("glyphicon glyphicon-info-sign");
			$("#info-progress").removeClass("progress-bar-warning").addClass("progress-bar-success");
		}
		var cont = JSON.parse(evt.data);//json文字列からオブジェクトに変換
		console.log(cont);
		if(typeof cont.celsius != undefined) {
			update_chart([(cont.celsius-0),(cont.humidity-0)]);
			set_log(createMsg(cont));
		}
	};
	ws.onclose = function(){
		console.log('ws_close_on_js');
	};
	
	function set_log(msg){
      $("#log-table").append(
        $("<tr></tr>")
       	.append($("<td></td>").text(toLocaleString(new Date())))
       	.append($("<td></td>").text(msg))
       );
	}
	
	function createMsg(data){
		wk = '[受信]'+'  '
		   	   +'温度:'+data.celsius+'  '
		   	   +'湿度:'+data.humidity;
	 	return wk;
	}

	var d_cels = [];//温度グラフデータ
	var d_humd = [];//湿度グラフデータ
	var totalPoints = 30;//グラフに表示される点の最大数
	var dataset;
	var cels_max = [];
	var cels_min = [];
	var humd_max = [];
	var humd_min = [];
	var set_celsius = [];
	var set_humidity = [];
	
	//グラフの基本設定
	var chart_option = {
		series: { shadowSize:0,lines:{show:true},points:{show:true}},
       grid:{clickable:true,hoverable:true,backgroundColor:"#F5F5F5",borderColor:"#DDDDDD"},
       yaxis: {min:0,max:35,tickColor:"#CCCCCC",font:{size:13,color:"#333333"}},
       legend:{show:true,position:"nw"},
       xaxis: {ticks:5, show: true, mode: "time", timeformat: "%Y/%m/%d %H:%M:%S",tickColor:"#999999"}
	};
	var chart_option2 = {
		series: { shadowSize:0,lines:{show:true},points:{show:true}},
       grid:{clickable:true,hoverable:true,backgroundColor:"#F5F5F5",borderColor:"#DDDDDD"},
       yaxis: {min:0,max:60,tickColor:"#CCCCCC",font:{size:13,color:"#333333"}},
       legend:{show:true,position:"nw"},
       xaxis: {ticks:5, show: true, mode: "time", timeformat: "%Y/%m/%d %H:%M:%S",tickColor:"#999999"}
	};
	
    //localStorageから前回のグラフデータを復元
	if(window.localStorage){
		if(localStorage.length > 0){
			d_cels= getLocalStorage("d_cels");
			d_humd = getLocalStorage("d_humd");
			cels_max = getLocalStorage("cels_max");
			cels_min = getLocalStorage("cels_min");
			humd_max = getLocalStorage("humd_max");
			humd_min = getLocalStorage("humd_min");
			set_celsius = getLocalStorage("set_celsius");
			set_humidity = getLocalStorage("set_humidity");
		}
	};
	
	function getLocalStorage(name){
		var wk = JSON.parse(localStorage.getItem(name));
		if(wk == null){
			return [];
		} else {
			return wk;
		}
	}


	$('.samebtn').click(function(){
		var i = $(this).attr('id');
	  	var target = $('#line'+i.slice(4));
	  	var t = target.offset().top-50;
	  	$('html,body').animate({scrollTop:t},"fast");
	  	return false;
	});
	
function chgTable(line,lineno,celsius,humidity,mode){
	var n = "#line"+id;
	if(mode == "now_p"){
		$(n).next().children('tbody').children('tr:nth-child(lineno)').children('td:nth-child(3)').text(celsius);
		$(n).next().children('tbody').children('tr:nth-child(lineno+1)').children('td:nth-child(3)').text(humidity);
	} else if(mode == "set_p"){
		$(n).next().children('tbody').children('tr:nth-child(lineno)').children('td:nth-child(4)').text(celsius);
		$(n).next().children('tbody').children('tr:nth-child(lineno+1)').children('td:nth-child(4)').text(humidity);
	} else if(mode == "status") {
		$(n).next().children('tbody').children('tr:nth-child(lineno)').children('td:nth-child(5)').children().remove();
		$(n).next().children('tbody').children('tr:nth-child(lineno)').children('td:nth-child(5)').append("<span class='label label-primary'>test</span>");
		$(n).next().children('tbody').children('tr:nth-child(lineno+1)').children('td:nth-child(5)').children().remove();
		$(n).next().children('tbody').children('tr:nth-child(lineno+1)').children('td:nth-child(5)').append("<span class='label label-primary'>test</span>");
	}
};

	//グラフデータのセット&表示の更新
    function update_chart(value){
    	var c_len = d_cels.length;
    	var h_len = d_humd.length;
        if(c_len > totalPoints){
            d_cels = d_cels.slice(1);
        }
        if(h_len > totalPoints){
        	d_humd = d_humd.slice(1);
        }
        var t = (new Date()).getTime();
        t += 32400000;
        d_cels.push([t,value[0]]);
        setStorage(d_cels,"d_cels");
        d_humd.push([t,value[1]]);
        setStorage(d_humd,"d_humd");
      	$("#cels_td").text(value[0]);
      	$("#humd_td").text(value[1]);
       
       stackArray(t,30,cels_max,c_len,0);
		stackArray(t,10,cels_min,c_len,0);
		stackArray(t,59,humd_max,h_len,1);
		stackArray(t,30,humd_min,h_len,1);
		stackArray(t,15,set_celsius,c_len,0);
		stackArray(t,40,set_humidity,h_len,0);
		
		setStorage(cels_max,"cels_max");
		setStorage(cels_min,"cels_min");
		setStorage(humd_max,"humd_max");
		setStorage(humd_min,"humd_min");
		setStorage(set_celsius,"set_celsius");
		setStorage(set_humidity,"set_humidity");
		
		dataset = [
        	{label:"温度",data:d_cels,color:"#FF5454"},
        	{label:"上限",data:cels_max,color:"#ffff80"},
        	{label:"下限",data:cels_min,color:"#ffff80"},
        	{label:"設定値",data:set_celsius,color:"#00c000"}
         ];
         dataset2 = [
         	{label:"湿度",data:d_humd,color:"#8080ff"},
         	{label:"上限",data:humd_max,color:"#ffff80"},
        	{label:"下限",data:humd_min,color:"#ffff80"},
        	{label:"設定値",data:set_humidity,color:"#00c000"}
         ];
        	 $.plot($("#chartline1A"),dataset,chart_option);
        	 $.plot($("#chartline1B"),dataset2,chart_option2);
          
   	  }	
   	  
   	  function stackArray(t,num,setArray,n_len,flg){
   	  	if(setArray.length == 0){
   	  		setArray.push([t,num]);
   	  		setArray.push([t,num]);
   	  	} else if(n_len > totalPoints) {
   	  		setArray.slice(1);
   	  		if(flg === 0){
   	  			setArray[0]=[d_cels[0][0],num];
   	  			setArray[1]=[d_cels[n_len-1][0],num];
   	  		} else if(flg === 1){
   	  			setArray[0]=[d_humd[0][0],num];
   	  			setArray[1]=[d_humd[n_len-1][0],num];
   	  		}
   	  	} else {
   	  		setArray.pop();
   	  		setArray.push([t,num]);
   	  	} 
   	  };
   	  
   	  //LocalStorageにグラフデータを保存
   	  function setStorage(ary,name){
   	  	var len = ary.length;
   	  	if(len > 0) {
   	  		var wk = JSON.stringify(ary);
   	  		localStorage.setItem(name,wk);
   	  	}
   	  };
   	  
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
		
		function toLocaleString( date )
		{
		    return [
		        date.getFullYear(),
		        date.getMonth() + 1,
		        date.getDate()
		        ].join( '/' ) + ' '
		        + date.toLocaleTimeString();
		}
		
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
	      
	 //レコードデータ取得
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
             			$("#loadingTable1").fadeOut();
               		reWriteTable(result);
               	
               },
               //失敗時の処理
             error:function(xhr, textStatus, error) {
                alert('通信失敗');
               }
         }); 
      });
      
      //非同期通信でサーバからデータを受信する
      function ajaxLoading(url,type,dataType,data,caseNum){
      	  $.ajax({
             url: url,
             type: type,
             dataType:dataType,
             data:data,                 
             timeout: 20000,
               //送信前
             beforeSend:function(xhr,settings) {},
               //応答後
             complete: function(xhr,textStatus) {},
               //通信成功時の処理
             success:function(result,textStatus,xhr) {
               	switch(caseNum){
               			case 0:
               				break;
               			case 1:
               				break;
               			case 2:
               					//レコード取得＆表示
               				$("#loadingTable1").fadeOut();
               				reWriteTable(result);
               				break;
               			case 3:
               					//ログデータ取得＆表示
               				$("#loadingTable2").fadeOut();
               				getLogWrite(result);
               				break;
               		}
               },
               //失敗時の処理
             error:function(xhr, textStatus, error) {
                alert('通信失敗');
               }
           });
       }
      
      //DBから取得したレコードをテーブルに動的生成
      function reWriteTable(data) {
       	var len = data.length;
       	$("#record-table").find("tr:eq(1)").remove();
       		for(var i=0; i<len; i++) {
       			$("#record-table").append(
       				$("<tr></tr>")
       					.append($("<td></td>").text(JSON.parse(data[i]).line))
       					.append($("<td></td>").text(JSON.parse(data[i]).lineno))
       					.append($("<td></td>").text(JSON.parse(data[i]).t_date))
       					.append($("<td></td>").text(JSON.parse(data[i]).celsius))
       					.append($("<td></td>").text(JSON.parse(data[i]).humidity))
       				);
       			}
       }
       
      //DBからログを取得しテーブルに動的生成
      function getLogWrite(data){
       	var len = data.length;
       	$("#log-table").find("tr:eq(1)").remove();
       	for(var i=0; i<len; i++){
       		$("#log-table").append(
	       		$("<tr></tr>")
	       		.append($("<td></td>").text(JSON.parse(data[i]).t_date))
	       		.append($("<td></td>").text(JSON.parse(data[i]).str))
	       		);
       		}
       }
       //表示完了後
       $('#myModal').on('shown.bs.modal', function (e) {
              console.log('shown');
              var d1 = [];
              for (var i = 0; i < 14; i += 0.5) {
	d1.push([i, Math.sin(i)]);
              }
              var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
              var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
              $.plot("#ModalChartMain", [ d1, d2, d3 ]);
              //一番最初のタブにセット
              $('#myTab a:first').tab('show');
        });
        
        //表示されはじめ
       $('#myModal').on('show.bs.modal',function(e){
           console.log('show');
       });
       //非表示完了後
        $('#myModal').on('hidden.bs.modal', function (e) {
              console.log('hidden');
        });
       
       $('#chartModalBtn').click(function(){
           $('#myModal').modal('show');
           console.log('myModal');
       });

       
});