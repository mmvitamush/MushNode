var database = require('./database_mysql');
var db = database.createClient();
var mushrecord = exports;

mushrecord.readRecord = function(lineid,lineno,start,end,callback){
    var params = [lineid,lineno,start,end];
    //var sql = 'select * from mushrecord where line = ? and lineno = ? and t_date between cast(? as datetime) and cast(? as datetime);';
    var sql = 'select * from mushrecord where lineid = ? and lineno = ? and t_date between ? and ? ;';
    db.query(sql,params,function(err,results){
            db.end();
            if(err){
                    console.log(err);
                    callback(new Error('select failed.'));
                    return;
            } 
            callback(err,results);
    });
};

mushrecord.readRecordAll = function(line,lineno,start,end,callback){
    var params = [line,lineno,start,end];
    var sql = 'select * from mushrecord;';
    db.query(sql,params,function(err,results){
            db.end();
            if(err){
                    console.log(err);
                    callback(new Error('select failed.'));
                    return;
            } 
            callback(err,results);
    });
};

mushrecord.insertUsers = function(params){
    var param = [
           params.userid,
           params.username,
           params.passwd,
           params.mailaddress,
           params.maildanger,
           params.mailwarning,
           params.level
        ];
        console.log(param);
        db.query(
                'INSERT INTO Users '
                + '(userid,username,passwd,mailaddress,maildanger,mailwarning,level) '
                + 'values(?,?,?,?,?,?,?)'
                + ';',
            param,
            function(err,results){
                    db.end();
                    //console.log(results);
                    if(err){
                        console.log(err);
                        
                        return;
                    }
                    
            });
};

mushrecord.getUsers = function(callback){
    var sql = 'select username,mailaddress,maildanger,mailwarning,level from Users;';
    db.query(sql,[],function(err,results){
            db.end();
            if(err){
                    console.log(err);
                    callback(new Error('select failed.'));
                    return;
            } 
            callback(err,results);
    });
};

mushrecord.updateUsers = function(params){
    
};

mushrecord.readDevice = function(callback){
    var sql = 'select lineid,lineno,auto_control,online from observationDevice;';
    db.query(sql,[],function(err,results){
            db.end();
            if(err){
                    console.log(err);
                    callback(new Error('select failed.'));
                    return;
            } 
            callback(err,results);
    });
};

//デバイスの設定情報を更新する
mushrecord.updateDevice = function(lineid,lineno,params){
    var param = [
           params.celsius_top_range,
           params.celsius_bottom_range,
           params.humidity_top_range,
           params.humidity_bottom_range,
           params.celsius_top_range_over,
           params.celsius_bottom_range_over,
           params.humidity_top_range_over,
           params.humidity_bottom_range_over
        ];
        console.log(param);
        db.query(
                'UPDATE observationDevice SET '
                + 'celsius_top_range = ?,'
                + 'celsius_bottom_range = ?,'
                + 'humidity_top_range = ?,'
                + 'humidity_bottom_range = ?,'
                + 'celsius_top_range_over = ?,'
                + 'celsius_bottom_range_over = ?,'
                + 'humidity_top_range_over = ?,'
                + 'humidity_bottom_range_over = ?'
                + 'where '
                + 'lineid = ' + lineid + ' and '
                + 'lineno = ' + lineno + ';',
            param,
            function(err,results){
                    db.end();
                    //console.log(results);
                    if(err){
                        console.log(err);
                        return;
                    }   
            });
};

mushrecord.setTimeSchedule = function(params,callback){
    var tblname = 'timeSchedule' + params.relaySelect;
    if(params.relaySelect !== '0'){
            sql = 'INSERT INTO ' + tblname + '('
            + 'lineid,lineno,start_date,end_date,top_range,bottom_range,top_range_over,bottom_range_over,vent_value,vent_flg '
            + ') VALUES ('
            + '?,?,?,?,?,?,?,?,?,?'
            + ');';
            db.query(sql,[
                params.lineid,
                params.lineno,
                params.start,
                params.end,
                params.top_range,
                params.bottom_range,
                params.top_range_over,
                params.bottom_range_over,
                params.vent_value,
                params.vent_flg
            ],function(err,res){
                    db.end();
                    if(err){
                        callback(new Error('Insert failed.[setTimeSchedule]'));
                    }
                    
                    callback(null);
            });
    } else {
        callback(new Error('relay No to 0.[setTimeSchedule]'));
    }   
};

mushrecord.getTimeSchedule = function(params,callback){
    var sql = 'select * from timeSchedule'+params.relaySelect+' where lineid = ? and lineno = ?;';
    db.query(sql,[params.lineid,params.lineno],function(err,results){
            db.end();
            if(err){
                    console.log(err);
                    callback(new Error('select failed.'));
                    return;
            } 
            callback(err,results);
    });    
};

mushrecord.deleteTimeSchedule = function(params,callback){
    var tblname = 'timeSchedule' + params.relaySelect;
    if(params.relaySelect !== '0'){
            var sql = "delete from "+tblname+" where lineid=? and lineno = ? and start_date = ? and end_date = ?;";
            db.query(sql,[
                params.lineid,
                params.lineno,
                params.start_date,
                params.end_date
            ],function(err,res){
                    db.end();
                    if(err){
                        callback(new Error('delete failed.[deleteTimeSchedule]'));
                    }
                    callback(null);
            });
    } else {
        callback(new Error('relay No to 0.[deleteTimeSchedule]'));
    }       
};

mushrecord.updateTimeSchedule = function(params,callback){
    var tblname = 'timeSchedule' + params.relaySelect;
    if(params.relaySelect !== '0'){
            var sql = "update "+tblname+" set top_range=?,\n\
                                                            bottom_range=?,\n\
                                                            top_range_over=?,\n\
                                                            bottom_range_over=?,\n\
                                                            vent_value=?,\n\
                                                            vent_flg=? where lineid=? and lineno = ? and start_date = ? and end_date = ?;";
            db.query(sql,[
                params.top_range,
                params.bottom_range,
                params.top_range_over,
                params.bottom_range_over,
                params.vent_value,
                params.vent_flg,
                params.lineid,
                params.lineno,
                params.start_date,
                params.end_date
            ],function(err,res){
                    db.end();
                    if(err){
                        callback(new Error('delete failed.[deleteTimeSchedule]'));
                    }
                    callback(null);
            });
    } else {
        callback(new Error('relay No to 0.[deleteTimeSchedule]'));
    }       
};