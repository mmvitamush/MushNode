
/*
 * GET home page.
 */
var db_mushrecord = require('../models/mushrecord');
var users = require('../models/users');
var redislibs = require('../models/redislibs');
var nmailer = require('nodemailer');
var async = require('async');
var config = require('../awss3conf');
var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId:config.accessKeyId,
    secretAccessKey:config.secretAccessKey,
    region:'ap-northeast-1'
});

exports.index = function(req, res){
//    var name = '??';
//    var password = '???????4';
//    users.createUser(name,password,function(err,sid){
//        if(err){
//            console.log('user creation failed.')
//        }
//        console.log('user ' + name + ' created. sid:  ' + sid);
//    });
  res.render('index', { title: 'Express' });
};

//ログイン処理を行う
exports.login = function(req,res){
   res.render('login',{
       page:{title:'login'},
       user:null,
       name:'',
       error:200,
       loginFailed:false
   });
   return;
};

//ログインフォームを処理する
exports.login.post = function(req,res){
   var name = req.body.name || '';
   var password = req.body.password || '';
   
   function authCallback(err,userInfo){
       if(err || userInfo === null){
           //認証失敗
           res.render('login',{
               page:{title:'login'},
               user:null,
               name:name,
               error:200,
               loginFailed:true
           });
           return;
       }
       //認証成功
       req.session.user = {
          uid:userInfo.id,
          name:userInfo.username
       };
       res.redirect('/record');
       return;
   };
   users.authenticate(name,password,authCallback);
};

//ログアウト
exports.logout = function(req,res){
   req.session.destroy(function(err){
       res.redirect('/login');
   }); 
};

exports.dashboard = function(req,res){
   if(req.session.user === undefined) {
       res.redirect(403,'/login');
       return;
   }
    res.render('dashboard',{
        page:{title:'Dashboard'},
        user:req.session.user,
        error:200
    });
};

exports.line = function(req,res){
    var lineId = Number(req.params.lineId);
   if(isNaN(lineId)){
       res.send(404);
       return;
   }
   var lineParams = {
      lineId:lineId 
   };
   res.render('line',{
       page:{title:'LINE'+lineId+':'+'Record'},
       lineParams:lineParams,
       error:200
   }); 
};

exports.summary = function(req,res){
   /*
    if(req.session.user === undefined) {
       res.redirect(403,'/login');
       return;
   }
   */
  var params = {
           'userid':1,
           'username':'川端　克明',
           'passwd':'mmn39504',
           'mailaddress':'mmbarion@gmail.com',
           'maildanger':1,
           'mailwarning':1,
           'level':3
  };
  //db_mushrecord.insertUsers(params);
  
    var lineData = ['1-1','1-2','2-1','2-2','3-1','4-1'];
    res.render('summary',{
        page:{title:'Summary'},
        user:req.session.user,
        lineData:lineData,
        error:200
    });    
};

exports.sample = function(req,res){
   var lineid = Number(req.params.lineid);
   var lineno = Number(req.params.lineno);
   if(!linecheck(lineid,lineno)){
       res.send(404);
       return;
   }
   var lineParams = {
      lineid:lineid,
      lineno:lineno
   };    
    var lineData = [];
    db_mushrecord.readDevice(function(err,results){
            if(err){
                console.log(err);
                lineData.push('1-1');
            }else{
                for(var i=0; i<results.length; i++){
                    lineData.push(results[i].lineid+'-'+results[i].lineno);
                }
            }   
            res.render('sample',{
                page:{title:'Sample Page'},
                user:req.session.user,
                lineLabel:lineData,
                lineParams:lineParams,
                error:200
            });
     });
 
};

exports.observer = function(req,res){
    var deviceData = [];
    db_mushrecord.readDevice(function(err,resp){
            if(err){
                console.log(err);
                deviceData.push('0-1');
            }else{
                for(var i=0; i<resp.length; i++){
                    deviceData.push({lineid:resp[i].lineid,lineno:resp[i].lineno,auto_control:resp[i].auto_control,online:resp[i].online});
                }
                console.log(deviceData);
            }   
            res.render('observer',{
                page:{title:'observer Page'},
                user:req.session.user,
                device:deviceData,
                error:200
            });
     });   
};

exports.record = function(req,res){
   if(req.session.user === undefined) {
       res.redirect(403,'/login');
       return;
   }
   
   var lineId = Number(req.params.lineId);
   var lineno = Number(req.params.lineno);
   if(!linecheck(lineid,lineno)){
       res.send(404);
       return;
   }
   var lineParams = {
      lineId:lineId 
   };
   
   res.render('record',{
       page:{title:'LINE'+lineId+':'+'Record'},
       lineParams:lineParams,
       user:req.session.user,
       error:200
   }); 
};

exports.schedule = function(req,res){
   var lineid = Number(req.params.lineid);
   var lineno = Number(req.params.lineno);
   if(!linecheck(lineid,lineno)){
       res.send(404);
       return;
   }
   var lineParams = {
      lineid:lineid,
      lineno:lineno
   };
   
   res.render('schedule',{
       page:{title:'LINE'+lineid+':'+'lineno'+' Schedule'},
       lineParams:lineParams,
       user:req.session.user,
       error:200
   });     
};

exports.getRecordData = function(req,res){
        var lineid = req.body.lineid;
        var lineno = req.body.lineno;
        //var start = new Date(req.body.start);
        //var end = new Date(req.body.end);
        var start = req.body.start;
        var end = req.body.end;
        db_mushrecord.readRecord(lineid,lineno,start,end,function(err,results){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            res.json(200,results);
            return;
        });
};

exports.getChart = function(req,res){
    /*
    var key = 'line:'+req.body.lineid+':'+req.body.lineno;
    redislibs.gethash(key,function(err,replies){
        if(err){
            console.log(err);
            res.send(500);
            return;
        }
        res.json(200,replies);
        return;
    });
    */
   var params = {
      lineid:req.body.lineid,
      lineno:req.body.lineno,
      pubdate:req.body.pubdate
   };
   redislibs.getPubData(params,function(err,replies){
       if(err){
            console.log(err);
            res.send(500);
            return;
        }
        res.json(200,replies);
        return;
   });
   
};

//設定の変更や登録があったときの処理
exports.changesetting = function(req,res){
   /* Redis */
   var hashkey = 'linesetting:'+req.body.lineid+':'+req.body.lineno; 
   var subkey = 'relay'+req.body.relaySelect;
   var obj = {
       start_date:req.body.start,
       end_date:req.body.end,
       bottom_range:req.body.rangeMin,
       top_range:req.body.rangeMax,
       top_range_over:req.body.topRangeOver,
       bottom_range_over:req.body.bottomRangeOver,
       vent_value:req.body.vent_value,
       vent_flg:req.body.vent_flg
   };
   redislibs.sethash(hashkey,subkey,JSON.stringify(obj),function(err,rep){
       if(err){
            console.log(err);
        }
   });
   
  /* MySQL Ver. */
  var params = {
        lineid:req.body.lineid,
        lineno:req.body.lineno,
        relaySelect:req.body.relaySelect,
        bottom_range:req.body.rangeMin,
        top_range:req.body.rangeMax,
        top_range_over:req.body.topRangeOver,
        bottom_range_over:req.body.bottomRangeOver,
        start:req.body.start,
        end:req.body.end,
        vent_value:req.body.vent_value,
        vent_flg:req.body.vent_flg
  };
            db_mushrecord.setTimeSchedule(params,function(err){
                var restr = 'changeSetting Success.';
                if(err){
                    console.log(err);
                    restr = 'changeSetting Error.'; 
                } 
                res.json(200,{'respons':restr});
                return;
            }); 
};

exports.getsetting = function(req,res){
    var key = 'linesetting:';
    //redislibs.trimHash({lineid:req.body.lineid,lineno:req.body.lineno});
    redislibs.getSettingData(req.body.lineid,req.body.lineno,key,function(err,rep){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            var str1 = JSON.parse(rep.relay1),
                  str2 = JSON.parse(rep.relay2),
                  str3 = JSON.parse(rep.relay3),
                  str4 = JSON.parse(rep.relay4);
           
           var obj = {
                top_range1:str1.top_range,
                bottom_range1:str1.bottom_range,
                top_range2:str2.top_range,
                bottom_range2:str2.bottom_range,
                top_range3:str3.top_range,
                bottom_range3:str3.bottom_range,
                top_range4:str4.top_range,
                bottom_range4:str4.bottom_range
             };
             res.json(200,obj);
             return;
    });
};

exports.getTimeSchedule = function(req,res){
    var params = {
        relaySelect:req.body.relaySelect,
        lineid:req.body.lineid,
        lineno:req.body.lineno
    };
    db_mushrecord.getTimeSchedule(params,function(err,results){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            res.json(200,results);
            return;
        });
};

exports.deleteTimeSchedule = function(req,res){
    var params = {
        relaySelect:req.body.relaySelect,
        lineid:req.body.lineid,
        lineno:req.body.lineno,
        start_date:req.body.start_date,
        end_date:req.body.end_date
    };
    if(checkNum(params)){
            db_mushrecord.deleteTimeSchedule(params,function(err){
                        var restr = 'Success';
                        if(err){
                            console.log(err);
                            restr = 'Error'; 
                        }
                        res.json(200,{'respons':restr});
                        return;
                    }); 
    } else {
         res.json(200,{'respons':'Error'});
         return;   
    }
};

exports.updateTimeSchedule = function(req,res){
    var params = {
        relaySelect:req.body.relaySelect,
        lineid:req.body.lineid,
        lineno:req.body.lineno,
        start_date:req.body.start_date,
        end_date:req.body.end_date,
        top_range:req.body.top_range,
        bottom_range:req.body.bottom_range,
        top_range_over:req.body.top_range_over,
        bottom_range_over:req.body.bottom_range_over,
        vent_value:req.body.vent_value,
        vent_flg:req.body.vent_flg
    };
    if(checkNum(params)){
            db_mushrecord.updateTimeSchedule(params,function(err){
                        var restr = 'Success';
                        if(err){
                            console.log(err);
                            restr = 'Error'; 
                        }
                        res.json(200,{'respons':restr});
                        return;
                    }); 
    } else {
         res.json(200,{'respons':'Error'});
         return;   
    }
};

exports.deleteCache = function(req,res){
    var lineid = req.body.lineid,
          lineno = req.body.lineno;
          redislibs.deleteRedis('linepub:'+lineid+':'+lineno);
          redislibs.deleteRedis('linepubdate:'+lineid+':'+lineno);
          res.json(200,{'respons':'deleteCache.'});
          return;
};

//SESでメールを送信する
exports.sendmail = function(req,res){
        var AWSES = require('aws-sdk');
        AWSES.config.loadFromPath('./sesMainConfig.json');
        var SES = new AWSES.SES();
        console.log(SES.endpoint);
        var params = {
                Source:'mushkk@mail-vitafactory.com',
                Destination:{
                    ToAddresses:['mmbarion@gmail.com']
                },
                Message: {
                    Subject:{
                        Data:req.body.subject
                    },
                    Body: {
                        Text: {
                            Data:req.body.text
                        }
                    }
                }
        };

        SES.sendEmail(params,function(err,data){
            if(err){
                console.log(err);
            }
            res.json(200,{'respons':'mail send.'});
            return;
        });
  
};

//S3から画像ファイルを取得
exports.getS3Photo = function(req,res){
    var s3 = new AWS.S3();
    var allkeys = [];
    var allUrl = [];
    s3.listObjects({Bucket:'mushbacket'},function(err,data){
        if(err){
            console.log(err);
        }else{
            allkeys.push(data.Contents);
            for(var i=0; i<data.Contents.length; i++){
                console.log(data.Contents[i].Key);
                var params = {Bucket:'mushbacket',Key:data.Contents[i].Key};
                var url = s3.getSignedUrl('getObject',params);
                allUrl.push({key:data.Contents[i].Key,url:url});
            }
        }
        res.json(200,allUrl);
    });
};

//Usersの取得と変更を行う
exports.getUsers = function(req,res){
    if(req.body.flg === 'select'){
        db_mushrecord.getUsers(function(err,results){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            res.json(200,results);
            return;
        });
    } else if(req.body.flg === 'update') {
        
    } else {
        res.json(200,{rep:'err'});
    }
};

exports.getLog = function(req,res){
    
};


exports.wsgate = function(req,res){
    
};

function linecheck(lineid,lineno){
   if(isNaN(lineid) && isNaN(lineno)){
       return false;
   } else {
       return true;
   }
}

//数値判定 数値ならtrueを返す
function checkNum(obj){
var keys = Object.keys(obj);
var flg = true;
var n;
for(var i=0; i<keys.length; i++){
    n = obj[keys[i]];
    if (!( n.replace(/[ 　]/g, '') != '' && !isNaN(n) )) {
        flg = false;
    }
}
return flg;
}