$(function(){
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
            editable:true,
            allDayDefault:false,
            slotEventOverlap:true,
            viewRender:function(view,element){          
                $.ajax({
                        url:"/api/schedule_read",
                        dataType:"json",
                        type:"POST",
                        timeout:20000,
                        data:{
                            start:view.start,
                            end:view.end
                        },
                        success:function(eventSource){
                              //calendar.fullCalendar('removeEvents');
                              calendar.fullCalendar('addEventSource', eventSource);
                        },
                        error:function(xhr, textStatus, error) {
                              console.log(error);
                              console.log('ajax-NG');
                        }
                });
            },
            dayRender:function(date,cell){
                console.log('dayRender');
            },
            viewDestroy:function(view,element){
                console.log('viewDestroy');
            },
            eventDblClick:function(event,jsEvent){
                    var title = prompt('予定を入力してください:', event.title);
                    if(title && title!==""){
                        event.title = title;
                        calendar.fullCalendar('updateEvent', event); //イベント（予定）の修正
                    }else{
                        calendar.fullCalendar("removeEvents", event.id); //イベント（予定）の削除              
                    }
            },
            select:function(start,end,allDay){
                    console.log('select');
            },
            eventDrop:function(event,delta){
                    console.log('drop');
            },
            dayClick:function(date,allDay,jsEvent,view){
                    calendar.fullCalendar('addEventSource',[{
                          title:'no title',
                          start:date,
                          allDay:allDay
                    }]);
            },
            eventClick:function(calEvent,jsEvent,view){
                    calEvent.title = 'hoge';
                    calendar.fullCalendar('updateEvent',calEvent);
            },
            loading:function(isLoading,view){
                console.log(isLoading);
                console.log('loading');
            },
            eventSources:[
                    {
                        events:[
                             {
//                                    title:'event1',
//                                    start:'2013-10-21 12:30:00',
//                                    end:'2013-10-25 18:00:00',
//                                    allDay:false
                             }
                        ]
                    }
            ]
    });
    
    
      //ajaxでフォーム情報を送信してDBに登録
      $('#calendar_form').submit(function(event){
              console.log('submit');
               //HTMLでの送信をキャンセル
               event.preventDefault();
               //操作対象のフォーム要素を取得
               var $form = $(this);
               //送信ボタンを取得
               var $button = $form.find('button');
               
               //送信
               $.ajax({
                        url: $form.attr('action'),
                        type: $form.attr('method'),
                        data: {
                               title:$form.find('[name=eventTitle]').val(),  
                               start:$form.find('[name=eventStart]').val(),
                               end:$form.find('[name=eventEnd]').val()
                        },                       
                        timeout: 20000,
                        //送信前
                        beforeSend:function(xhr,settings) {
                                //ボタンを無効化し、二重送信を防止
                                $button.attr('disabled',true);
                                //処理中であることをわかりやすくする
                                //$('#cels_loading').html("<img src='../images/loadinfo.gif'/>");
                        },
                        //応答後
                        complete: function(xhr,textStatus) {
                                //ボタンを有効化し、再送信を許可
                                $button.attr('disabled',false);
                                //$('#cels_loading').empty();
                        },
                        //通信成功時の処理
                        success:function(result,textStatus,xhr) {
                               var eventSource = {
                                   title:$form.find('[name=eventTitle]').val(),  
                                   start:$form.find('[name=eventStart]').val(),
                                   end:$form.find('[name=eventEnd]').val(),
                                   editable:true,
                                   allDay:false,
                                   backgroundColor:"#666666",
                                   borderColor:"#222222",
                                   textColor:"#FEFEFE"
                               };
                               //入力値を初期化
                               $form[0].reset();
                               calendar.fullCalendar('renderEvent',eventSource);
                        },
                        //失敗時の処理
                        error:function(xhr, textStatus, error) {
                              console.log(error);
                              console.log('ajax-NG');
                        }
               });
        });
        
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
});