module.exports = function(app) {  //receiving "app" instance
    app.route('/passchange/:id')
        .get(getA)
        .post(postA);
}
var a;
function getA(req, res) {
    res.render("passchange.ejs",{data:''});
    a=req.url
    console.log(a+"first one");
}
var connection = require('../sql_connection'); //sql connection
function postA(req, res) {
  // handle potential trailing slash
  if(a != null)
  { 
    console.log(a+"second one");
      var b= a.substring(a.lastIndexOf('/') + 1);
      console.log(b);
      connection.query("UPDATE `signup` SET `password`='"+req.body.password+"' WHERE `userid`='"+b+"' ", function (err, result, fields) {
        if (err) throw err;
       
        else{
            if(result != '')
            {
                 res.render('passchange.ejs',{ data:"Password has been changed click to login"});
            }
            else{
                res.render('passchange.ejs',{data:"Try again"});
            }       
        }
    })

   }
   
}