var mythos = require('./cthulize.js');
var crit = new mythos.Cthulhu();

exports.about = function(req, res) {
    var tools = [
    { desc : crit.getAdjective(true) + " operating system", key : "Debian Linux 6.0/7.1", url : "http://www.debian.org"},
    { desc : crit.getAdjective(true) + " editor", key : "Vim 7.3.x", url : "http://www.vim.org"},
    { desc : crit.getAdjective(true) + " programming environment", key : "Node.js", url : "http://www.nodejs.org"},
    { desc : crit.getAdjective(true) + " framework", key : "Express.js", url : "http://expressjs.com"},
    { desc : crit.getAdjective(true) + " web server", key : "Lighttpd", url : "http://www.lighttpd.net"}]

    res.render('about',{ title : "About Mythos As A Service", mythos : crit, tools : tools });
}


