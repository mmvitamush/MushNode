
/*
 * GET home page.
 */
var db_mushrecord = require('../models/mushrecord');
var users = require('../models/users');
var redislibs = require('../models/redislibs');

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
    var lineData = ['1-1','1-2','2-1','2-2','3-1','4-1'];
    res.render('summary',{
        page:{title:'Summary'},
        user:req.session.user,
        lineData:lineData,
        error:200
    });    
};

exports.sample = function(req,res){
    res.render('sample',{
        page:{title:'Sample Page'},
        user:req.session.user,
        error:200
    })
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
};

exports.getsetting = function(req,res){
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
};

exports.getLog = function(req,res){
    
};


exports.wsgate = function(req,res){
    
};