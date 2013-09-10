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

/// Creates an array of full creatures, maxed out at 100 items
var createJsonCreatures = function (req) {
    var cnt = 1;
    try {
       cnt = parseInt(req.params.monsters);
       if (cnt < 0) cnt = 1;
       if (cnt > 100) cnt = 100;
    }
    catch (e) {
    }
    var resx = [];
    for (var h =0; h < cnt; h++) {
        c = crit.fullCreature();
        resx.push(c);
    }
    return resx; 
}

var _jsonCreature = function(req,res,d) {
    try {
        var resx = d;
        res.writeHead(200, {'Content-type':'text/json' });
        res.write (JSON.stringify(data));
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


var _creature = function(req, res,d) {
    var resx = d;
    try {
        //sconsole.log("Storemythos");
        //sconsole.log(res_data);
        console.log(JSON.stringify(resx));
        if (req.params.tabular && req.params.tabular == 'table')
            res.render('table',{ title : "Monster Roster", mythos : crit, monsters : resx.mythos });
        else
            res.render('page',{ title : "Monsters", monsters : resx.mythos, mythos:crit }); 
    }
    catch (e) {
        console.log ("Error! " + e);
        
        res.write(JSON.stringify(resx));
        res.end();
    }
        
}



var _textCreature = function(req,res,d) {
    try {
        res.writeHead(200, {'Content-type':'text/plain' });
        res.write("OK");
        for (var x = 0; x < resx.length; x++) {
            var w = resx[x];
            res.write (w.name + "\t" + w.description + "\t" + w.sanity + "\n");
        }
    }
    catch (e) {
        res.writeHead(200, {'Content-type':'text/plain' });
        res.write("Error! " + e);
        
    }
    res.end();
}

var fullCreature = function (req,res) {
    var d = createJsonCreatures(req);
    storeMythos (d, function (err, data) {
        if (err)
            console.log("Error");
        else {
            formatCreatureData(req,res,d);
        }
    });
}



var formatCreatureData = function(req,res,d) {
    //var d = createJsonCreatures(req);
    console.log("Formatting mythos");
    res.format({
        'text/plain': function(){
            console.log("text");
            _textCreature(req,res,d);
        },

        'text/html': function(){
            console.log("html");
            _creature(req,res,d);
        },

        'application/json': function(){
            console.log("json");
            _jsonCreature(req,res,d);
        },
        '*/*' : function() {
            console.log("*");
            _textCreature(req,res,d);
        }

    });
}

exports.creature = fullCreature;
exports.jsonCreature = fullCreature;



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
                console.log(result);
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

function commonJsonDataGenerator(req,res,data,template) {
    //sconsole.log("invoking data generatoor - "+ data || "no-data");
    res.write(JSON.stringify(data[template]));
    res.end();
}

function commonJsonPageGenerator (req, res, data, template) {
    //sconsole.log("Generating page " + (data || "no data")+ ","+ (template || " no tpl" ));
    console.log ("Data for template: ");
    console.log (JSON.stringify(data));

    data[template]["mythos"] = crit;
    data[template]["slug"] = data["slug"];

    res.render (template, data[template]);    

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
        json : function() { commonJsonDataGenerator(req,res,data,template); }
    });
}

function commonDataCallback (req, res, funcToExec, key, title) {
    createJsonDataGenerator (req, res, funcToExec, key, title, function (err, data) {
        if (err) {
            console.log ("Error with " + key);
            res.render("eldritch_error", { title : "Eldritch Error!" });
        }
        else {
            commonOutput(req,res, data, key);
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

exports.readMythosFromMongo = function (req,res) {
    var slug = req.params.slug || "mythos-1";
    var type = slug.split("-")[0];
    coll.findOne({ 'slug' : slug },{},function (err, found_data) {
        if (err) {
            console.log(err);
            res.render ("eldritch_error", { title : 'The Great Library of Caelano does not contain the tome labelled ' + slug });
        } else {
            console.log ("Found!");
            console.log(found_data);
            if (found_data != null) {
                found_data["book"] = true;
                found_data[type]["book"] = true;
                if (type != 'mythos') 
                    commonOutput(req,res,found_data, type);
                else
                    formatCreatureData(req,res, found_data);
            }
            else
                res.render ("eldritch_error", { title: 'Drain you of your sanity -- face the thing that should not be' });

        }
    });

}



