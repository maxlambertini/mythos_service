var mythos = require('./cthulize.js');
var crit = new mythos.Cthulhu();

var template_map = {
    'mythos' : 'page',
    'eldergods' : 'eldergods',
    'names' : 'names',
    'adjectives' : 'adjectves',
    'peoples':'people'
};

var keyRec = {
    key : "mythosrec",
    mythos : 0,
    eldergods : 0, 
    names : 0,
    adjectives : 0,
    peoples : 0
};

var mongodb = require('mongodb');
var server = new mongodb.Server('localhost',27017,{auto_reconnect : true});
var db = new mongodb.Db('mythosDB',server);
var coll = null;
var keysRecord = null;

var createKeyrecData = function(coll, field, callBack) {
    coll.findOne({ 'key' : 'mythosrec'},{},function (err, found_data) {
        if (err) {
            console.log(err);
            callBack(err,null);
        }
        else {
            console.log(" createKeyrecData -- found: " + JSON.stringify(found_data));
            var data = found_data;
            if (data )  {
                console.log("Metadata found, calling back -- " + JSON.stringify(data));
                var my_data = {
                    mythos : data.mythos, eldergods : data.eldergods,
                    names : data.names, adjectives : data.adjectives,
                    peoples : data.peoples  
                }
                my_data[field]++;
                callBack(null,my_data);
            }
            else {
                var newData = keyRec;
                newData[field]++;
                callBack(null, newData);

            }
        }
    });
}


db.open(function(err,res) {;
    coll = db.createCollection('mythos',{safe:true},
        function (err,collection) {
            if (err) {
                //sconsole.log("Error creating mythos ", err);
                coll = db.collection('mythos',{safe:true},function(err,res) {
                    if (err) 
                    console.log(err);
                });
            } else {
                //sconsole.log("Collection: " + collection || "[null]");
                coll = collection;
            }
        });
});

//sconsole.log("Coll is: "+ coll || "undefined");


var _creature = function(req, res) {
   var cnt = 1;
   if (req.params && req.params.monsters) {
       ////sconsole.log("Monsters: " + req.params.monsters);
       try {
           cnt = parseInt(req.params.monsters,10);
           ////sconsole.log(cnt);
           if (cnt < 0) cnt = 1;
           if (cnt > 100) cnt = 100;
       }
       catch (e) {
           //sconsole.log(cnt);
           //sconsole.log("Error!!!!" + e);
       }
   }
   var resx = [];
   for (var h =0; h < cnt; h++) {
        c = crit.fullCreature();
        resx.push(c);
    }
   storeMythos(resx, function (err, res_data) {
        if (err) {
            //sconsole.log(err)
        }
        else {
            try {
                //sconsole.log("Storemythos");
                //sconsole.log(res_data);
                if (req.params.tabular && req.params.tabular == 'table')
                   res.render('table',{ title : "Monster Roster", mythos : crit, monsters : res_data.mythos });
                else
                    res.render('page',{ title : "Monsters", monsters : res_data.mythos, mythos:crit }); 
            }
            catch (e) {
                res.write(JSON.stringify(resx));
            }
        }
   });
        
}


var storeStuff = function (resx, key, callback) {
    var jsonData = { status:'ok' };
    jsonData[key] = resx;
    createKeyrecData(coll, key, function (err, keyrec_data) {
        if (err) {
            //sconsole.log("Error storeStuff: " +err);
            callback (err, null);
        }
        else {
            console.log ("Updating metadata -- " + JSON.stringify(keyrec_data));
            coll.update ({'key' : 'mythosrec'  }, { $set :  keyrec_data },{ upsert: true}, function (err2, update_data) {
                if (err2) {
                    console.log ("Errorescion!");
                    console.log(err2);
                    callback(err2,null);
                }
                else {
                    console.log ("Metadata updated : " + JSON.stringify (update_data));
                    jsonData["type"]  = key;
                    jsonData["slug"] = key + "-"+new String(keyrec_data[key]);
                    coll.insert(jsonData,{safe:true},function(err3,result) {
                        //sconsole.log("Inserting data");
                        if (err3) {
                            //sconsole.log(err);
                            callback(err,null);
                        }
                        else {
                            //sconsole.log("_id: " + result[0]["_id"]+"\n"+JSON.stringify(result));
                            callback(null,jsonData);

                        }
                    });
                }
            
            });
        }
    });
}



var storeMythos = function (resx, callback) {
    var jsonData = { status:'ok', mythos: resx };
    createKeyrecData(coll, 'mythos', function (err, keyrec_data) {
        if (err) {
            //sconsole.log(err);
            callback (err, null);
        }
        else {
            coll.update ({'key' : 'mythosrec'  },{ $set :  keyrec_data}, { upsert: true, safe: true}, function (err2, update_data) {
                if (err2) {
                    //sconsole.log(err);
                    callback(err,null);
                }
                else {
                    jsonData["type"]  = "mythos";
                    jsonData["slug"] = "mythos-"+ new String(keyrec_data["mythos"]);
                    coll.insert(jsonData,{safe:true}, function (err3,result) {
                        if (err3) {
                            //sconsole.log(err3);
                            callback (err3,null);
                        }
                        else {
                            //sconsole.log("Mythos ok");
                            //sconsole.log(result[0]._id);
                            //sconsole.log ("Passing jsonData: "+JSON.stringify(jsonData));
                            callback (null,jsonData);
                        }
                    });
                }
            });
        }
    });
}

var _jsonCreature = function(req,res) {
    var cnt = 1;
    try {
        if (req.params && req.params.monsters) {
            try {
                cnt = parseInt(req.params.monsters,10);
                if (cnt < 0) cnt = 1;
                if (cnt > 100) cnt = 100; //max out at 100 critters;
            }
            catch (e) {
                //sconsole.log(cnt);
                //sconsole.log("Error!!!!" + e);
            }
        }
        var resx = [];
        for (var h =0; h < cnt; h++) {
            c = crit.fullCreature();
            resx.push(c);
        }
        res.writeHead(200, {'Content-type':'text/json' });
        storeMythos (resx, function (err, data) {
            if (err) {
                //sconsole.log("Storing mythos failed: " + err);
                res.write(JSON.stringify( {
                    status : 'ko',
                    error : e 
                }));
            }
            else {
                res.write (JSON.stringify(data));
            }
        });
    }
    catch (e) {
        res.writeHead(200, {'Content-type':'text/json' });
        res.write(JSON.stringify( {
            status : 'ko',
            error : e 
        }));
    }
    res.end();
}

var _textCreature = function(req,res) {
    var cnt = 1;
    try {
        if (req.params && req.params.monsters) {
            try {
                cnt = parseInt(req.params.monsters,10);
                if (cnt < 0) cnt = 1;
                if (cnt > 100) cnt = 100; //max out at 100 critters;
            }
            catch (e) {
                //sconsole.log(cnt);
                //sconsole.log("Error!!!!" + e);
            }
        }
        var resx = [];
        for (var h =0; h < cnt; h++) {
            c = crit.fullCreature();
            resx.push(c);
        }
        storeMythos(resx, function (err, data) {
            res.writeHead(200, {'Content-type':'text/plain' });
            if (err)
                res.write("KO");
            else {
                res.write("OK");
                for (var x = 0; x < resx.length; x++) {
                    var w = resx[x];
                    res.write (w.name + "\t" + w.description + "\t" + w.sanity + "\n");
                }
            }
        });
    }
    catch (e) {
        res.writeHead(200, {'Content-type':'text/plain' });
        res.write("Error! " + e);
        
    }
    res.end();
}

exports.creature = function(req,res) {
    req.accepts('text/plain');
    req.accepts('text/html');
    req.accepts('application/json');
    //sconsole.log(req.accepted);
    res.format({
        'text/plain': function(){
            _textCreature(req,res);
        },

        'text/html': function(){
            _creature(req,res);
        },

        'application/json': function(){
            _jsonCreature(req,res);
        },
        '*/*' : function() {
            _textCreature(req,res);
        }
    });
/*
    res.format(
    { 'text/html' : function() { _creature(req,res); } },
    { 'application/json' : function() { _jsonCreature(req,res); }   },
    { 'text/plain' : function () { _creature(req,res); } }
    )
    */
}
exports.jsonCreature = _jsonCreature



function createJsonDataGenerator (req,res,jsonDataFunction,jsonKey, jsonTitle,callback) {
    var cnt = 1;
    var dataKey = jsonKey || "data";
    var title = jsonTitle || "Title"
    //sconsole.log ("jsonKey " + dataKey);
    //sconsole.log("num " + req.params.num);
    //sconsole.log (jsonDataFunction);
    _res = {};
    try {
        if (req.params && req.params.num) {
            try {
                cnt = parseInt(req.params.num,10);
                if (cnt < 0) cnt = 1;
                if (cnt > 100) cnt = 100; //max out at 100 critters;
            }
            catch (e) {
                //sconsole.log(cnt);
                //sconsole.log("Error!!!!" + e);
            }
        }
        var resx = [];
        //sconsole.log("Generating " + cnt);
        for (var h =0; h < cnt; h++) {
            eval ("var c = " + jsonDataFunction);
            resx.push(c);
        }
        var obj = { "status" : 'ok' };
        obj[dataKey] = resx;
        obj["title"] = jsonTitle;

        var jsonObj = {  'title' : jsonTitle };
        jsonObj[dataKey] = resx;
        storeStuff(jsonObj, dataKey, function (err, result) {
            if (err) {
                //sconsole.log("Error inserting data " + err) ;
                callback(err,null);
            } else {
                //sconsole.log("Stuff inserted");
                //sconsole.log(result);
                callback (null, result);
            }
        });

    }
    catch (e) {
        //sconsole.log("Error in generation " + e)
        _res = {
            status : 'ko',
            title : jsonTitle,
            error : e 
        };
    }
    return _res;
}

function commonJsonDataGenerator(req,res,data) {
    //sconsole.log("invoking data generatoor - "+ data || "no-data");
    res.write(JSON.stringify(data));
    res.end();
}

function commonJsonPageGenerator (req, res, data, template) {
    //sconsole.log("Generating page " + (data || "no data")+ ","+ (template || " no tpl" ));
    data["mythos"] = crit;
    res.render (template, data);    

}

function commonJsonTextGenerator (req,res,data,template) {
    var arr = data[template];
    if (arr && arr.length) {
        for (var x = 1; x < arr.length; x++)
            res.write(arr[x]+"\n");
    }
    res.end();

}

function commonOutput(req,res,data,template) {
    res.format ( {
        text : function() { commonJsonTextGenerator(req,res,data,template); },
        html : function() { commonJsonPageGenerator(req,res,data,template); },
        json : function() { commonJsonDataGenerator(req,res,data); }
    });
}

function commonDataCallback (req, res, funcToExec, key, title) {
    createJsonDataGenerator (req, res, funcToExec, key, title, function (err, data) {
        if (err) {
            console.log ("Error with " + key);
            res.render("eldritch_error", { title : "Eldritch Error!" });
        }
        else {
            commonOutput(req,res, data[key], key);
        }
            
    });
}

exports.jsonElderGods = function(req,res) {
    //sconsole.log("Invoking jsonElderGods... ");
    var data = commonDataCallback(req, res, "crit.getElderGod()", "eldergods","Elder Gods");
 
}

exports.jsonAdjectives = function(req,res) {
    //sconsole.log ("Invoking jsonAdjectives");
    var data = commonDataCallback(req, res, "crit.getAdjective()", "adjectives","Adjectives");
}

exports.jsonPeople = function (req,res) {
    //sconsole.log("Invoking jsonPeople");
    var data = commonDataCallback(req,res, "crit.getPeople()","peoples", "Peoples");
}

exports.jsonNames = function(req,res) {
    //sconsole.log("Invoking jsonNames");
    var data = commonDataCallback(req, res, "crit.getCompleteName()", "names", "Names");
}



