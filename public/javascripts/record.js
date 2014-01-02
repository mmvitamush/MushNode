$(document).ready(function() {
        $('.simple-menu').sidr();
        var ws = io.connect('http://localhost:3000');
        ws.on("connect",function(){console.log('s.on Connect');});
        ws.on("disconnect",function(){console.log('s.on Disconnect');});
        ws.on("greeting",function(data,fn){
            console.log('s.on Greeting');
            var answer = data.message;
            fn(answer);
        });
});


$(function(){
    //.activeを含まないradio(label)ボタンをクリックした時
    $(document).on('click','#toggleBtns label:not(".active")',function(){
        console.log($(this).find('input').attr('id'));
        var rd = $(this).find('input').attr('id');
        if(rd === 'option-ch1'){
            
        }else if(rd === 'option-ch2'){
            
        }else if(rd === 'option-ch3'){
            
        }
    });
    $('#myTab a:first').tab('show');
    
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5) {
	d1.push([i, Math.sin(i)]);
    }
    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
    $.plot("#RecordChartMain", [ d1, d2, d3 ]);
    
    $('#chartrefreshBtn').click(function(){
        var wk_d = {line:1,lineno:1,start:'2013-12-27 00:00:00',end:'2013-12-27 23:59:59'};
        ajaxLoading('http://www.vita-factory.com/api/getRecordData','post','json',wk_d,0);
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
                        console.log('ajax Success!');
                        console.log(result);
                        setStorage(result,'mushrecordAll');
                        console.log(getLocalStorage('mushrecordAll'));
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
       
    //LocalStorageにグラフデータを保存
    function setStorage(ary,name){
            var len = ary.length;
            if(len > 0) {
                var wk = JSON.stringify(ary);
                localStorage.setItem(name,wk);
            }
     };
     
     //LocalStorageから取り出す
     function getLocalStorage(name){
            var wk = JSON.parse(localStorage.getItem(name));
            if (wk == null){
	return [];
            } else {
	return wk;
            }
    }
    
});