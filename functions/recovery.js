module.exports = function(app) {  //receiving "app" instance
    app.route('/recovery')
        .get(getA)
        .post(postA);
}

function getA(req, res) {
    res.render("recovery.ejs",{data:''});
}
var connection = require('../sql_connection'); //sql connection
var nodemailer = require('nodemailer'); //node mailer
var crypto=require('crypto');
var async=require('async');
function postA(req, res) {
   if(req.body.email != ''){
    connection.query("select * from signup where email='"+req.body.email+"'", function (err, result, fields) {
      if (err) throw err;
      if(result != '')
      {
        if(result[0].email == req.body.email)
        {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                  user: 'carrentalve@gmail.com',
                  pass: 'Im215group9'
                }
              });
                     var otp=Math.floor(Math.random() * ( 999999-100000));
              var mailOptions = {
                from: 'carrentalve@gmail.com',
                to: req.body.email,
                subject: 'Car rental verification email',
                text: 'This is the verification code to change password. Do not share with others ** '+ otp+' ** with user id ** '+result[0].userid+'**'
              };
       
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  connection.query("INSERT INTO `otpt`(`userid`, `otp`) VALUES ('"+result[0].userid+"','"+otp+"')", function (err, result, fields) {
                    if (err) throw err;
                  })
                  res.redirect('verification/'+result[0].userid);
                }
              });
        }
        else{
              res.render("recovery.ejs",{data:'Email and username dosent match'});
        }
      }
      else{
        res.render("recovery.ejs",{data:'Email is not registered '});
      }
    })
  }
  else{
    res.render("recovery.ejs",{data:'Email should not be empty'});
  }
}