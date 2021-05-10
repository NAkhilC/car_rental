module.exports = function(app) {  //receiving "app" instance
    app.route('/signup')
        .get(getA)
        .post(postA);
}
const express = require('express')

function getA(req, res) {
   
    res.render("signup.ejs",{data:""})
}
var connection = require('../sql_connection'); //sql connection


function postA(req, res) {
   if(req.body.fname=='')
   {
    res.render("signup.ejs",{data:'Name should not be empty'});
   }
   else if(req.body.userid == '' && req.body.userid < 4)
   {
    res.render("signup.ejs",{data:'userid should be more than 5 charecters'});
   }
   else if(req.body.password != req.body.password2)
   {
    res.render("signup.ejs",{data:'password should match'});
   }
   else{
   
    connection.query("select * from signup where userid='"+req.body.userid+"'", function (err, result, fields) {
        // if any error while executing above query, throw error
        if (err) throw err;
        if(result.length>0)
        {  
          res.render("signup.ejs",{data:'Choose a different ID'});
        }
        else{
          connection.query("select * from signup where email='"+req.body.email+"'", function (err, result, fields) {
            // if any error while executing above query, throw error
            if (err) throw err;
            if(result.length>0)
            { 
              res.render("signup.ejs",{data:'Email already exist'});
              
            }
            else{
              connection.query("INSERT INTO `signup`(`first_name`, `last_name`, `userid`, `password`, `email`) VALUES ('"+req.body.fname+"', '"+req.body.lname+"','"+req.body.userid+"','"+req.body.password+"','"+req.body.email+"')", function (err, result, fields) {
                if (err) throw err;
                res.render("signup.ejs",{data:'User created'});
              })
            }
          });
        }
      });
}
}