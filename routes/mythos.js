var mythos = require('./cthulize.js');
var crit = new mythos.Cthulhu();



var _creature = function(req, res) {
   var cnt = 1;
   if (req.params && req.params.monsters) {
       //console.log("Monsters: " + req.params.monsters);
       try {
           cnt = parseInt(req.params.monsters,10);
           //console.log(cnt);
           if (cnt < 0) cnt = 1;
           if (cnt > 100) cnt = 100;
       }
       catch (e) {
           console.log(cnt);
           console.log("Error!!!!" + e);
       }
   }
   var resx = [];
   for (var h =0; h < cnt; h++) {
        c = crit.fullCreature();
        resx.push(c);
    }
   try {
   if (req.params.tabular && req.params.tabular == 'table')
      res.render('table',{ title : "Monster Roster", mythos : crit, monsters : resx });
   else
      res.render('page',{ title : "Monsters", monsters : resx, mythos:crit }); 
   }
   catch (e) {
       res.render(JSON.stringify(resx));
   }
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
                console.log(cnt);
                console.log("Error!!!!" + e);
            }
        }
        var resx = [];
        for (var h =0; h < cnt; h++) {
            c = crit.fullCreature();
            resx.push(c);
        }
        res.writeHead(200, {'Content-type':'text/json' });
        res.write(JSON.stringify( { status:'ok', mythos: resx }));
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
                console.log(cnt);
                console.log("Error!!!!" + e);
            }
        }
        var resx = [];
        for (var h =0; h < cnt; h++) {
            c = crit.fullCreature();
            resx.push(c);
        }
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

exports.creature = function(req,res) {
    req.accepts('text/plain');
    req.accepts('text/html');
    req.accepts('application/json');
    console.log(req.accepted);
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



function createJsonDataGenerator (req,res,jsonDataFunction,jsonKey, jsonTitle) {
    var cnt = 1;
    var dataKey = jsonKey || "data";
    var title = jsonTitle || "Title"
    console.log ("jsonKey " + dataKey);
    console.log("num " + req.params.num);
    console.log (jsonDataFunction);
    _res = {};
    try {
        if (req.params && req.params.num) {
            try {
                cnt = parseInt(req.params.num,10);
                if (cnt < 0) cnt = 1;
                if (cnt > 100) cnt = 100; //max out at 100 critters;
            }
            catch (e) {
                console.log(cnt);
                console.log("Error!!!!" + e);
            }
        }
        var resx = [];
        console.log("Generating " + cnt);
        for (var h =0; h < cnt; h++) {
            eval ("var c = " + jsonDataFunction);
            resx.push(c);
        }
        var obj = { "status" : 'ok' };
        obj[dataKey] = resx;
        obj["title"] = jsonTitle;
        _res = obj;
    }
    catch (e) {
        console.log("Error in generation " + e)
        _res = {
            status : 'ko',
            title : jsonTitle,
            error : e 
        };
    }
    return _res;
}

function commonJsonDataGenerator(req,res,data) {
    console.log("invoking data generatoor - "+ data || "no-data");
    res.writeHead(200, {'Content-type':'text/json' });
    res.write(JSON.stringify(data));
    res.end();
}

function commonJsonPageGenerator (req, res, data, template) {
    console.log("Generating page " + (data || "no data")+ ","+ (template || " no tpl" ));
    data["mythos"] = crit;
    res.render (template, data);    

}

function commonJsonTextGenerator (req,res,data,template) {
    var arr = data[template];
    res.writeHead(200, { 'Content-type' : 'text/plain' });
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

exports.jsonElderGods = function(req,res) {
    console.log("Invoking jsonElderGods... ");
    var data = createJsonDataGenerator(req,res,"crit.getElderGod()","eldergods","Elder Gods");
    commonOutput(req,res,data,"eldergods");
}

exports.jsonAdjectives = function(req,res) {
    console.log ("Invoking jsonAdjectives");
    var data = createJsonDataGenerator(req, res, "crit.getAdjective()", "adjectives","Adjectives");
    commonOutput(req,res,data,"adjectives");
}

exports.jsonPeople = function (req,res) {
    console.log("Invoking jsonPeople");
    var data = createJsonDataGenerator(req,res, "crit.getPeople()","peoples", "Peoples");
    commonOutput(req,res,data,"peoples");
}

exports.jsonNames = function(req,res) {
    console.log("Invoking jsonNames");
    var data = createJsonDataGenerator(req, res, "crit.getCompleteName()", "names", "Names");
    commonOutput(req,res,data,"names");
}



