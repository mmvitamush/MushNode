var config = require('../config');
var client = require('redis').createClient(config.redisPort,config.redisHost);
var async = require('async');

exports.gethash = function(key,callback){
    client.hgetall(key,function(err,replies){
        if(err){
            console.log(err);
            callback(new Error('redislibs: gethash error.'));
            return;
        }
        
        callback(err,replies);
    });
};

exports.sethash = function(key,subkey,params,callback){
    client.hset(key,subkey,params,function(err,rep){
        if(err){
            console.log(err);
            callback(new Error('redislibs: sethash error.'));
            return;
        }
        callback(err,rep);
    });
};

//１分ごとのセンサーデータを引き出す
exports.getPubData = function(params,cb){
    var lineid = params.lineid;
    var lineno = params.lineno;
    var pubDate = params.pubdate;
    var key = 'linepubdate:'+lineid+':'+lineno+':'+pubDate;
    client.lrange(key,0,-1,function(err,reps){
        if(err){
            console.log(err);
        } else {
            var wk,str;
            var arr = [];
            /*
            reps.forEach(function(rep){
                client.hget('linepub:'+lineid+':'+lineno,rep,function(err,replay){
                    if(err){
                        console.log(err);
                    } else {
                        str = JSON.parse(replay);
                        wk = JSON.stringify({t_date:rep,celsius:str.celsius,humidity:str.humidity});
                        console.log(wk);
                        arr.push(wk);
                    }
                });
            });
            console.log(arr);
            */
           async.forEachSeries(reps,function(rep,callback){
               client.hget('linepub:'+lineid+':'+lineno,rep,function(err,replay){
                    if(err){
                        console.log(err);
                    } else {
                        str = JSON.parse(replay);
                        wk = {t_date:(rep*1),celsius:str.celsius,humidity:str.humidity};
                        arr.push(wk);
                    }
                    callback();
                });    
           },function(err){
               cb(err,arr);
           });
        }
    });
};

exports.getSettingData = function(key,subkey,callback){
    client.hget(key,subkey,function(err,repliy){
            if(err){
                console.log(err);
                callback(new Error('redislibs: gethash error.'));
                return;
            }
        
            callback(err,JSON.parse(repliy));
    });
};