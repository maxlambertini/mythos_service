
/*
 * GET home page.
 */

var mythos = require('./cthulize');
var crit = new mythos.Cthulhu();

exports.index = function(req, res){
    var adj = crit.getAdjective(true);
  res.render('index', { 
      title: 'Mythos as a Service: The Random, Undeterministic Source  Of Lovecraftian Mythos',
      blurb: "Mythos as a Service",
      subblurb: 'The ' + adj + ' Source of Lovecraftian Mythos',
      mythos: crit
  });
};
