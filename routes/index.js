
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
   if(isNaN(lineId)){
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
   if(isNaN(lineid)){
       res.send(404);
       return;
   }
   var lineno = Number(req.params.lineno);
   if(isNaN(lineno)){
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


exports.changesetting = function(req,res){
   /* 
    * Redis Ver.
   var hashkey = 'linesetting'; 
   var subkey = req.body.lineid + ':' + req.body.lineno;
   var params = {
       targetCelsius:req.body.targetCelsius,
       targetHumidity:req.body.targetHumidity,
       celsiusMode:req.body.celsiusMode,
       humidityMode:req.body.humidityMode,
       delayCelsius:{top:req.body.delayCelsius.top,under:req.body.delayCelsius.under},
       delayHumidity:{top:req.body.delayhumidity.top,under:req.body.delayhumidity.under}
   };
   redislibs.sethash(hashkey,subkey,JSON.stringify(params),function(err,rep){
       if(err){
            console.log(err);
            res.send(500);
            return;
        }
        
        res.send(200);
        return;
   });
   */
  
  /* MySQL Ver. */
  var params = {
        lineid:req.body.lineid,
        lineno:req.body.lineno,
        relaySelect:req.body.relaySelect,
        rangeMin:req.body.rangeMin,
        rangeMax:req.body.rangeMax,
        topRangeOver:req.body.topRangeOver,
        bottomRangeOver:req.body.bottomRangeOver,
        start:req.body.start,
        end:req.body.end
  };
            db_mushrecord.setTimeSchedule(params,function(err){
                var restr = 'changeSetting Success.';
                if(err){
                    console.log(err);
                    restr = 'changeSetting Error.' 
                }
                res.json(200,{'respons':restr});
                return;
            }); 
};

exports.getsetting = function(req,res){
    
    /*
     * Redis Ver.
    var hashkey = 'linesetting';
    var subkey = req.body.lineid + ':' + req.body.lineno;
    
    redislibs.getSettingData(hashkey,subkey,function(err,rep){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            res.json(200,rep);
            return;
    });
    */
   
   /* MySQL Ver. */
   res.json(200,{'res':'ok'});
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
        bottom_range_over:req.body.bottom_range_over
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

//SESでメールを送信する
exports.sendmail = function(req,res){
        var AWSES = require('aws-sdk');
        AWSES.config.loadFromPath('./sesMainConfig.json');
        var SES = new AWSES.SES();
        console.log(SES.endpoint);
        var params = {
                Source:'mmbarion@gmail.com',
                Destination:{
                    ToAddresses:['mmbarion@gmail.com'],
                },
                Message: {
                    Subject:{
                        Data:'aws ses mail send test'
                    },
                    Body: {
                        Text: {
                            Data:'クラウドサーバーからメール送信テスト'
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