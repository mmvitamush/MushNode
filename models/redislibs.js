var config = require('../config');
var client = require('redis').createClient(config.redisPort,config.redisHost);

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
