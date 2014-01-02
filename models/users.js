var crypto = require('crypto');
var database = require('./database_mysql');
var db = database.createClient();
var users = exports;

//認証を行う
users.authenticate = function(name,password,callback){
    db.query('SELECT * FROM tcpms WHERE username = ?',[name,],queryCallback);
    function queryCallback(err,results,fields){
        db.end();
        if(err){
            callback(err);
            return;
        }
        if(results && (results.length > 0)){
            userInfo = results[0];
            if(userInfo.password == _hashPassword(password)){
                delete userInfo.password;
                callback(null,userInfo);
                return;
            }
        }
        //該当ユーザー無し
        callback(err,null);
        return;
    }
};

//パスワードのハッシュを作成する
function _hashPassword(password){
   if(password === ''){
       return '';
   } 
   var shasum = crypto.createHash('sha256');
   shasum.update(password);
   return shasum.digest('hex');
};

//ユーザーの作成
users.createUser = function(name,password,callback){
   var hashedPassword = _hashPassword(password);
   db.query(
           'INSERT INTO tcpms '
           + '(id,username,password)'
           + 'VALUES '
           + '(NULL,?,?)'
           + ';',
           [name,hashedPassword],
           function (err,results,fields){
               db.end();
               var sid = results.insertId;
               if(err){
                   callback(new Error('Insert failed.'));
               }
               callback(null, sid);
           });
};