var mythos = require('./cthulize.js');
var crit = new mythos.Cthulhu();

exports.api = function(req, res) {

    res.render('api',{ title : "Cthulhu Mythos As A Service API", mythos : crit });
}


