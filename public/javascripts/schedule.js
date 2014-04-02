var lineid,lineno;
var calEvent = [];
var calendarid = 0;
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
           var setData = {
                lineid:lineid,
                lineno:lineno,
                relaySelect:$('#RelaySelector option:selected').val()
            };
           var rep = ajaxLoading('http://www.vita-factory.com/api/getTimeSchedule','post','json',setData);
           //カレンダーイベントデータの初期化
           calEvent.length = 0;
           $('#calendar1').fullCalendar('removeEvents');
           $('#scheduleTable').empty();
           addScheduleData(rep);
           $('#RelayLabel').html($('#RelaySelector option:selected').text().substr(7));    
           if($('#RelaySelector option:selected').val() === '4'){
               $('#range1').rangeSlider('option','bounds',{min: 100, max: 2000});
               $('#range1').rangeSlider('option','step',10);
           } else {
               $('#range1').rangeSlider('option','bounds',{min: 0, max: 100}); 
               $('#range1').rangeSlider('option','step',1);
           }
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
        
   $('#editdatetimepicker1').datetimepicker({
	addSliderAccess: true,
	sliderAccessArgs: { touchonly: false },
	changeMonth: false,
	changeYear: false,
                  dateFormat:'yy/mm/dd'
        });
        
   $('#editdatetimepicker2').datetimepicker({
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
           end:Math.round((new Date($('#datetimepicker2').val())).getTime()/1000),
           vent_value:parseFloat($('#range1').rangeSlider("max"))+parseFloat($('#ventilationSpinner').val()),
           vent_flg:$('[name=ventRadio]:checked').val()
       };
       var rep = ajaxLoading('http://www.vita-factory.com/api/changesetting','post','json',setData);
       if(rep.respons === "changeSetting Success."){
           var rep = [{
               start_date:Math.round((new Date($('#datetimepicker1').val())).getTime()/1000),
               end_date:Math.round((new Date($('#datetimepicker2').val())).getTime()/1000),
               top_range:$('#range1').rangeSlider("max"),
               top_range_over:$('[name=TopRange]:checked').val(),
               bottom_range:$('#range1').rangeSlider("min"),
               bottom_range_over:$('[name=BottomRange]:checked').val(),
               vent_value:parseFloat($('#range1').rangeSlider("max"))+parseFloat($('#ventilationSpinner').val()),
               vent_flg:$('[name=ventRadio]:checked').val()
           }];
           //カレンダーイベントデータの初期化
           calEvent.length = 0;
           addScheduleData(rep);
       }else{
           window.alert('設定変更失敗.管理者に問い合わせてください');
       }
   });
   
   //編集ダイアログ内の登録ボタン
   $('#editsetBtn').click(function(){
       $('#dialog-edit').dialog("close");
       //イベントの再セット
       resetCalendarEvent();
   });
   
   var calendar = $('#calendar1').fullCalendar({
            header: {
               left:'prev,next,today',
               center:'title',
               right:'month agendaWeek agendaDay'
            },
            theme:false,
            //weekends:true,
            defaultView:'month',
            slotMinutes:15,
            snapMinutes:15,
            firstHour:0,
            minTime:0,
            maxTime:24,
            selectable:true,
            selectHelper:true,
            editable:false,
            allDayDefault:false,
            slotEventOverlap:true,
            eventRender:function(event,element){
                    element.find('span.fc-event-title').html(element.find('span.fc-event-title').text());
            },
            eventMouseover:function(calEvent,jsEvent){
                $('body').prepend(calEvent.tooltip);
                xOffset = 60 + $('#tooltip').height();
                yOffset = -40;
                $('#tooltip')
                .css('top', (jsEvent.clientY - xOffset) + 'px')
                .css('left', (jsEvent.clientX + yOffset) + 'px')
                .fadeIn();
            },
            eventMouseout:function(calEvent,jsEvent){
                $('#tooltip').remove();
            },
            eventClick: function(calEvent, jsEvent, view) {
                $('#scheduleTable > tr').css("background","#FFF");
                $('#scheduletr'+calEvent.id).css("background","#DDD");
                //var position = $('#scheduletr'+calEvent.id).offset().top;
                var baseposition = $('#scheduletr1').position().top;
                var targetposition = $('#scheduletr'+calEvent.id).position().top;
                $('#schedulePanel').animate({scrollTop:targetposition - baseposition},
                {
                    duration:400,
                    easing:"swing"
                });
            },
            dayClick: function(date, allDay, jsEvent, view) {
                $('#scheduleTable > tr').css("background","#FFF");
            }
   });
   
   var spinner = $( "#ventilationSpinner" ).spinner();
});

$(window).load(function(){
    
});

//登録済みスケジュール一覧を動的に作成
function addScheduleData(rep) {
    var doc = $('#scheduleTable');
    for(var i = 0; i<rep.length; i++){
        /* カレンダーにイベント情報を追加する */
        createCalendarEvent(rep[i]);
        /* 登録済みスケジュール一覧テーブルを生成 */
        doc.append(
            $('<tr id="scheduletr'+calendarid+'" />')
                            .append($('<td />').html(computeDuration(rep[i].start_date)+'<br />'+computeDuration(rep[i].end_date)))
                            .append($('<td />').html(rep[i].top_range+'<br />'+chkOver(rep[i].top_range_over)))
                            .append($('<td  />').html(rep[i].bottom_range+'<br />'+chkOver(rep[i].bottom_range_over)))
                            .append($('<td  />').html(rep[i].vent_value+'<br />'+chkOver(rep[i].vent_flg)))
                            //.append($('<td ><button id="editbtn'+calendarid+'" class="btn btn-success"><span class="glyphicon glyphicon-pencil"></span></button></td>'))
                            //.append($('<td ><button id="removebtn'+calendarid+'" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></td>'))
                            .append($('<td >\n\
                            <button id="editbtn'+calendarid+'" class="btn btn-success"><span class="glyphicon glyphicon-pencil"></span></button><br />\n\
                            <button id="removebtn'+calendarid+'" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>\n\
                            </td>'))
                            .append($('<input type="hidden" name="start_date" value="'+rep[i].start_date+'" />'))
                            .append($('<input type="hidden" name="end_date" value="'+rep[i].end_date+'" />'))
                            .append($('<input type="hidden" name="top_range" value="'+rep[i].top_range+'" />'))
                            .append($('<input type="hidden" name="bottom_range" value="'+rep[i].bottom_range+'" />'))
                            .append($('<input type="hidden" name="calendar_id" value="'+calendarid+'" />'))
                            .append($('<input type="hidden" name="top_range_over" value="'+rep[i].top_range_over+'" />'))
                            .append($('<input type="hidden" name="bottom_range_over" value="'+rep[i].bottom_range_over+'" />'))
                            .append($('<input type="hidden" name="vent_value" value="'+rep[i].vent_value+'" />'))
                            .append($('<input type="hidden" name="vent_flg" value="'+rep[i].vent_flg+'" />'))
        );
        /* 編集ボタン */
        $('#editbtn'+calendarid).on('click',function(){
                var elm = $(this).closest('tr');
                $('#dialog-edit').dialog({
                    resizable:false,
                    width:500,
                    height:520,
                    modal:true,
                    title:"スケジュール編集",
                    open:function(event, ui){ 
                        $(".ui-dialog-titlebar-close").hide();
                               $('#editrange1').rangeSlider({
                                bounds:{min: 0, max: 100},
                                defaultValues:{min:0,max:10},
                                arrows:false,
                                step:1
                            });
                            $( "#editventilationSpinner" ).spinner();
                            $('#editrange1').rangeSlider("values", elm.find("[name=bottom_range]").val(), elm.find("[name=top_range]").val());
                            $('#editdatetimepicker1').val(computeDuration(elm.find("[name=start_date]").val()));
                            $('#editdatetimepicker2').val(computeDuration(elm.find("[name=end_date]").val()));
                            $('#edit-dialog-content input[name="editTopRange"]').val([elm.find("[name=top_range_over]").val()]);
                            $('#edit-dialog-content input[name="editBottomRange"]').val([elm.find("[name=bottom_range_over]").val()]);
                            $('#editdatetimepicker1').attr('disabled', true);
                            $('#editdatetimepicker2').attr('disabled', true);
                            $('#edit-dialog-content > input[name=target_id]').val(elm.find("[name=calendar_id]").val());
                            $('#edit-dialog-content > input[name=edit_start_date]').val(elm.find("[name=start_date]").val());
                            $('#edit-dialog-content > input[name=edit_end_date]').val(elm.find("[name=end_date]").val());
                            $('#editventilationSpinner').val(parseFloat(elm.find("[name=vent_value]").val()) - parseFloat(elm.find("[name=top_range]").val()));
                            $('#edit-dialog-content input[name="editventRadio"]').val([elm.find("[name=vent_flg]").val()]);
                    },
                    buttons:{
                        "キャンセル":function(){
                            $(this).dialog("close");
                        }
                    },
                    close : function(){
                        $('#editdatetimepicker1').removeAttr("disabled");
                        $('#editdatetimepicker1').removeAttr("disabled");
                    }
                });
        });
        /* 削除ボタン */
        $('#removebtn'+calendarid).on('click',function(){
                var elm = $(this).closest('tr');
                $('#dialog-confirm').dialog({
                    resizable:false,
                    width:500,
                    height:400,
                    modal:true,
                    title:"削除確認",
                    open:function(event, ui){ 
                        $(".ui-dialog-titlebar-close").hide();
                        $('#delete-dialog-content').empty();
                        $('#delete-dialog-content')
                                .append($('<p />').text('ライン:'+lineid+'-'+lineno))
                                .append($('<p />').text('開始日時: '+computeDuration(elm.find("[name=start_date]").val())))
                                .append($('<p />').text('終了日時: '+computeDuration(elm.find("[name=end_date]").val())))
                                .append($('<p />').text('換気上限 : '+elm.find("[name=vent_value]").val()))
                                .append($('<p />').text('上限 : '+elm.find("[name=top_range]").val()))
                                .append($('<p />').text('下限 : '+elm.find("[name=bottom_range]").val()));
                    },
                    buttons:{
                        "削除する":function(){
                            $(this).dialog("close");
                            $('#dialog-loading').dialog({
                                    resizable:false,
                                    modal:true,
                                    width:250,
                                    height:250,
                                    draggable: false,
                                    title:"しばらくお待ちください",
                                    open:function(ev,ui){
                                        $(".ui-dialog-titlebar-close").hide();
                                        /* ajaxでサーバーに削除命令を送信 */
                                        var postData = {
                                            relaySelect:$('#RelaySelector option:selected').val(),
                                            lineid:lineid,
                                            lineno:lineno,
                                            start_date:elm.find("[name=start_date]").val(),
                                            end_date:elm.find("[name=end_date]").val()
                                        };
                                 
                                        var rep = ajaxLoading('http://www.vita-factory.com/api/deleteTimeSchedule','post','json',postData);
                                        if(rep.respons === "Success"){
                                            $(this).dialog("close");
                                            elm.fadeOut( 500, function(){$(this).remove();});
                                            $('#calendar1').fullCalendar('removeEvents',elm.find("[name=calendar_id]").val());
                                        }else{
                                            $(this).dialog("close");
                                            window.alert('削除に失敗しました');
                                        }
                                        
                                    }
                            });
                        },
                        "キャンセル":function(){
                            $(this).dialog("close");
                        }
                    },
                    close : function(){
                        //$(this).dialog("destory").remove();
                    }
                });
        });
  
    }
    
    if(calEvent.length > 0){
        $('#calendar1').fullCalendar('addEventSource',calEvent);
    }
};

//FullCalendar用EventObjectを作成
function createCalendarEvent(params){
    calendarid++;//カレンダーのid用カウンタ
    var event = {
        id:calendarid,
        title:'上限: '+params.top_range+' 下限: '+params.bottom_range,
        start:params.start_date,
        end:params.end_date,
        allDay:false,
        'tooltip':createTooltipElement(params)
    };
    calEvent.push(event);
    //$('#calendar1').fullCalendar('renderEvent',event);
};

//イベント編集後のイベント情報書き換え
function resetCalendarEvent(){
    var obj = {
          id:$('#edit-dialog-content > input[name=target_id]').val(),
          top_range:$('#editrange1').rangeSlider("max"),
          bottom_range:$('#editrange1').rangeSlider("min"),
          start_date:$('#edit-dialog-content > input[name=edit_start_date]').val(),
          end_date:$('#edit-dialog-content > input[name=edit_end_date]').val(),
          top_range_over:$('#edit-dialog-content  input[name="editTopRange"]:checked').val(),
          bottom_range_over:$('#edit-dialog-content  input[name="editBottomRange"]:checked').val(),
          vent_value:parseFloat($('#editventilationSpinner').val())+parseFloat($('#editrange1').rangeSlider("max")),
          vent_flg:$('#edit-dialog-content  input[name="editventRadio"]:checked').val()
       };
       
       //編集データをサーバに送り更新する
                            $('#dialog-loading').dialog({
                                    resizable:false,
                                    modal:true,
                                    width:250,
                                    height:250,
                                    draggable: false,
                                    title:"しばらくお待ちください",
                                    open:function(ev,ui){
                                        $(".ui-dialog-titlebar-close").hide();
                                        /* ajaxでサーバーに更新命令を送信 */
                                        var postData = {
                                            relaySelect:$('#RelaySelector option:selected').val(),
                                            lineid:lineid,
                                            lineno:lineno,
                                            start_date:obj.start_date,
                                            end_date:obj.end_date,
                                            top_range:obj.top_range,
                                            bottom_range:obj.bottom_range,
                                            top_range_over:obj.top_range_over,
                                            bottom_range_over:obj.bottom_range_over,
                                            vent_value:obj.vent_value,
                                            vent_flg:obj.vent_flg
                                        };
                                 
                                        var rep = ajaxLoading('http://www.vita-factory.com/api/updateTimeSchedule','post','json',postData);
                                        if(rep.respons === "Success"){
                                            $(this).dialog("close");
                                            var elm = $('#scheduletr'+obj.id);
                                            elm.find('td').eq(1).html(obj.top_range+'<br>'+chkOver(obj.top_range_over));
                                            elm.find('td').eq(2).html(obj.bottom_range+'<br>'+chkOver(obj.bottom_range_over));
                                            //hiddenを更新する
                                            elm.children('[name=top_range]').val(obj.top_range);
                                            elm.children('[name=bottom_range]').val(obj.bottom_range);
                                            elm.children('[name=top_range]').val(obj.top_range);
                                            elm.children('[name=top_range_over]').val(obj.top_range_over);
                                            elm.children('[name=bottom_range_over]').val(obj.bottom_range_over);
                                            elm.children('[name=vent_value]').val(obj.vent_value);
                                            elm.children('[name=vent_flg]').val(obj.vent_flg);
                                            var event = [{
                                                 id:obj.id,
                                                 title:'上限: '+obj.top_range+' 下限: '+obj.bottom_range,
                                                 start:obj.start_date,
                                                 end:obj.end_date,
                                                 allDay:false,
                                                 'tooltip':createTooltipElement(obj)
                                            }];
                                            $('#calendar1').fullCalendar('removeEvents',obj.id);
                                            $('#calendar1').fullCalendar('addEventSource',event);  
                                        }else{
                                            $(this).dialog("close");
                                            window.alert('スケジュール更新に失敗しました');
                                        }
                                        
                                    }
                            });    
    
};

function createTooltipElement(dt){
    var doc = $('<div id="tooltip" />')
            .append($('<p />').text('開始日時: '+computeDuration(dt.start_date)))
            .append($('<p />').text('終了日時: '+computeDuration(dt.end_date)))
            .append($('<p />').text('上限: '+dt.top_range))
            .append($('<p />').text('上限到達時: '+chkOver(dt.top_range_over)))
            .append($('<p />').text('下限: '+dt.bottom_range))
            .append($('<p />').text('下限到達時: '+chkOver(dt.bottom_range_over)))
            .append($('<p />').text('換気上限: '+dt.vent_value))
            .append($('<p />').text('換気上限到達時: '+chkOver(dt.vent_flg)));
    return doc;
};

function chkOver(flg){
    if(parseInt(flg) === 0){
        return "OFF";
    } else {
        return "ON"; 
    }
};

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
    var M = toDoubleDigits(data.getMonth()+1);
    var D = toDoubleDigits(data.getDate());
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