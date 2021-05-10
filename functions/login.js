module.exports = function(app) {  //receiving "app" instance
    app.route('/login')
        .get(getA)
        .post(postA);
}


function getA(req, res) {
    
    if(req.session.userid)
    {
      res.redirect("/home");
    }
    else{
      res.render("login.ejs",{data:''});
    }
}
var connection = require('../sql_connection'); 
function postA(req, res) {
    connection.query("select * from signup where userid='"+req.body.name+"'", function (err, result, fields) {
        // if any error while executing above query, throw error
        if (err) throw err;
        if(req.body.name=='')
         {
         res.render("login.ejs",{data:'userid should not be empty'});
         }
        else if(req.body.password == '')
        {
     res.render("login.ejs",{data:'password should not be empty'});
       }
        else if (result.length>0)
        {
          if (result[0].userid == req.body.name && result[0].password == req.body.password)
               {
                    useridn=result[0].userid;
                    req.session.userid=result[0].userid;
                    if(!req.session)
                     {
                      return res.status(401).send();
                     }
                     else{
                       res.redirect('home');
                       connection.query("INSERT INTO `log_history`( `userid`) VALUES ('"+req.session.userid+"')", function (err, result, fields) {
                        if (err) throw err;
                      })
                    console.log("from register page --- "+result[0].firts_name)}
                    
               } 
                else{
                  console.log("incorrect password");
                  res.render("login.ejs",{data:'incorrect password'});
                    }
        }
        else{
          res.render("login.ejs",{data:'No user exist with this userid'});
        }
      });
}