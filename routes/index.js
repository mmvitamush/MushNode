
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
        var line = req.body.line;
        var lineno = req.body.lineno;
        var start = new Date(req.body.start);
        var end = new Date(req.body.end);
        db_mushrecord.readRecordAll(line,lineno,start,end,function(err,results){
            if(err){
                console.log(err);
                res.send(500);
                return;
            }
            console.log(results);
            res.json(200,results);
            return;
        });
};

exports.getChart = function(req,res){
    var key = 'linepub:'+req.body.lineid;
    redislibs.gethash(key,function(err,replies){
        if(err){
            console.log(err);
            res.send(500);
            return;
        }
        console.log(replies);
        res.json(200,replies);
        return;
    });
        
    
};

exports.getLog = function(req,res){
    
};


exports.wsgate = function(req,res){
    
};