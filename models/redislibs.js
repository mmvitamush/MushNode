var config = require('../config');
var redis = require('redis');
var client = require('redis').createClient(config.redisPort,config.redisHost);
var async = require('async');
var maxlen = 100;

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

//keyに対応するキーを削除
exports.deleteRedis = function(key){
    client.del(key);
};

//１分ごとのセンサーデータを引き出す
exports.getPubData = function(params,cb){
    var lineid = params.lineid;
    var lineno = params.lineno;
    var pubDate = params.pubdate;
    var key = 'linepubdate:'+lineid+':'+lineno;
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
                        arr.unshift(str);
                    }
                    callback();
                });    
           },function(err){
               cb(err,arr);
           });
        }
    });
};

exports.getSettingData = function(lineid,lineno,key,callback){
    var hashkey = key+lineid+':'+lineno;
    client.hgetall(hashkey,function(err,repliy){
            if(err){
                console.log(err);
                callback(new Error('redislibs: gethash error.'));
                return;
            }
            if(!repliy){
                var emp = {
                           top_range:0,
                           bottom_range:0,
                           top_range_over:0,
                           bottom_range_over:0,
                           start_date:0,
                           end_date:0,
                           vent_value:0,
                           vent_flg:0                    
                };
                var json1 = {
                   relay1:JSON.stringify(emp),
                    relay2:JSON.stringify(emp),
                    relay3:JSON.stringify(emp),
                    relay4:JSON.stringify(emp)
                };
                client.hmset(hashkey,
                        'relay1',JSON.stringify(emp),
                        'relay2',JSON.stringify(emp),
                        'relay3',JSON.stringify(emp),
                        'relay4',JSON.stringify(emp),
                        function(err,rep){
                            if(err){
                                console.log(err);
                            }
                        });
                callback(err,json1);
            } else {
               callback(err,repliy);
            }
    });
};

//keyに対しobjの内容をpublishする
exports.publishRedis = function(key,obj){
    if(obj){
        client.publish(key,JSON.stringify(obj));
    }
};

//linepub:?:? と linepubdate:?:?の保持データ数を同じにする(リストlinepubに存在しない日時データを消す)
exports.trimHash = function(params){
    var lineid = params.lineid;
    var lineno = params.lineno;
    var hkey = 'linepub:'+lineid+':'+lineno;
    
    var lkey = 'linepubdate:'+lineid+':'+lineno;
    console.log('trimHash Start.');
    client.lrange(lkey,0,-1,function(err,lreps){
        client.hgetall(hkey,function(err,reps){
            console.log('async forEach Start.');
            for(var ks in reps){
                var s = JSON.parse(reps[ks]);
                var wk = s.t_date;
                var flg = false;
                async.series([
                    function(cb){
                            for(var i=0; i<lreps.length; i++){
                                if(wk == lreps[i]){
                                    flg = true;
                                }
                            }
                            cb(null,'');
                    },function(cb){
                        if(!flg){
                            client.hdel(hkey,wk);
                        }
                        cb(null,'');
                    }
                ],function(err,res){});
            } 
            console.log('trimHash end.');
        });        
    });    
};