var mythos = require('./cthulize.js');
var crit = new mythos.Cthulhu();

exports.creature = function(req, res) {
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


exports.jsonCreature = function(req,res) {
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

function commonJsonDataGenerator (req,res,jsonDataFunction,jsonKey) {
    var cnt = 1;
    var dataKey = jsonKey || "data"
    console.log ("jsonKey " + dataKey);
    console.log("num " + req.params.num);
    console.log (jsonDataFunction);
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
        res.writeHead(200, {'Content-type':'text/json' });
        var obj = { "status" : 'ok' };
        obj[dataKey] = resx;
        res.write(JSON.stringify(obj)); 
    }
    catch (e) {
        console.log("Error in generation " + e)
        res.writeHead(200, {'Content-type':'text/json' });
        res.write(JSON.stringify( {
            status : 'ko',
            error : e 
        }));
    }
    res.end();
}

exports.jsonElderGods = function(req,res) {
    console.log("Invoking jsonElderGods... ");
    commonJsonDataGenerator(req,res,"crit.getElderGod()","eldergods");
    res.end();
}

exports.jsonAdjectives = function(req,res) {
    console.log ("Invoking jsonAdjectives");
    commonJsonDataGenerator(req, res, "crit.getAdjective()", "adjectives");
}

exports.jsonPeople = function (req,res) {
    console.log("Invoking jsonPeople");
    commonJsonDataGenerator(req,res, "crit.getPeople()","peoples");
}

exports.jsonNames = function(req,res) {
    console.log("Invoking jsonNames");
    commonJsonDataGenerator(req, res, "crit.getCompleteName()", "names");
}


