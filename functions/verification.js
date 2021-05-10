module.exports = function(app) {  //receiving "app" instance
    app.route('/verification/:id')
        .get(getA)
        .post(postA);
}
var id;
function getA(req, res) {
    res.render("verification.ejs",{data:''});
}
var connection = require('../sql_connection'); //sql connection
function postA(req, res) {
    connection.query("select * from otpt where userid='"+req.body.userid+"' order by timestamp desc", function (err, result, fields) {
        if (err) throw err; 
        if(req.body.otp==result[0].otp)
        {console.log(req.body.userid)
            res.redirect('/passchange/'+req.body.userid);
        }
    })
}