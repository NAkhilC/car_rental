app.post('/recovery', (req, res) =>
{ 
  console.log("ok")
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'carrentalve@gmail.com',
      pass: 'Im215group9'
    }
  });
  
  var mailOptions = {
    from: 'carrentalve@gmail.com',
    to: req.body.email,
    subject: 'Car rental verification email',
    text: 'This is the verification code to change password. Do not share with others'+Math.floor(Math.random() * 1000000) + 1+''
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.redirect("login");
    }
  });
})