
/*
 * GET home page.
 */
var db_mushrecord = require('../models/mushrecord');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.dashboard = function(req,res){
    res.render('dashboard',{title:'Dashboard'});
};

exports.record = function(req,res){
   res.render('record',{title:'Record'}); 
};

exports.getRecordData = function(req,res){
        var line = req.body.line;
        var lineno = req.body.lineno;
        var start = new Date(req.body.start);
        var end = new Date(req.body.end);
        db_mushrecord.readRecord(line,lineno,start,end,function(err,results){
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
    
};

exports.getLog = function(req,res){
    
};