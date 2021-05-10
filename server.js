const express = require('express');
var session=require("express-session");

var nodemailer = require('nodemailer');
// Create Express app
const app = express()
var connection = require('./sql_connection.js'); //sql connection

app.use(session({secret:"aj7634brgrnioev8b",resave:false,saveUninitialized:true}))
app.use(express.urlencoded({extended:false}))
app.set('view-engine','ejs')
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});  
app.use(express.static('public'));
const path=require('path');
const { response } = require('express');
const { fstat } = require('fs');
app.use('/',(req,res,next)=>
{
  next();
})
// A sample route
app.get('/', async(req, res) =>
{ 
   res.render("index.ejs")
})
require('./functions/recovery')(app);
require('./functions/login')(app);
require('./functions/signup')(app);
require('./functions/logout')(app);
require('./functions/verification')(app);
require('./functions/passchange')(app);

app.get('/home', async(req, res) =>
{ 
    if(req.session.userid)
    {
      connection.query("SELECT * FROM `log_history` WHERE  userid='"+req.session.userid+"' order by timestamp desc LIMIT 8;", function (err, result, fields) {
        if (err) throw err; 
        console.log(JSON.parse(JSON.stringify(result)))
        res.render("home.ejs",{inout:'logout', info: JSON.parse(JSON.stringify(result)), userid: req.session.userid, message:""});
      })
     
    }
    else{ return res.render("home.ejs",{inout:"login", info: "no login history",userid: "Guest", message:""}); }
    
})
app.get('/profile', async(req, res) =>
{ 
    if(req.session.userid)
    {
      connection.query("SELECT * FROM `signup` WHERE  userid='"+req.session.userid+"'", function (err, result, fields) {
        if (err) throw err; 
        console.log(JSON.parse(JSON.stringify(result)))
      res.render("profile.ejs",{inout:"logout", info:  JSON.parse(JSON.stringify(result)),userid: req.session.userid,message: ""}); 
    })
     }
    else{ 
      return res.render("home.ejs",{inout:"login", info: "no login history",userid: "Guest",message: ""}); 
    }
    
})
app.post('/profile', async(req, res) =>
{ 
    if(req.session.userid)
    {
      connection.query("SELECT * FROM `signup` WHERE  userid='"+req.session.userid+"'", function (err, result, fields) {
        if (err) throw err; 
        if(req.body.password != req.body.password2 )
        {
          console.log("password does not match")
          res.render("profile.ejs",{inout:"logout", info:  JSON.parse(JSON.stringify(result)),userid: req.session.userid,message:"password dose not match"}); 
        }
        else
         {
            var pass=req.body.password;
            if(req.body.password == '')
            {
              pass=result[0].password;
            }
          connection.query( "UPDATE `signup` SET `first_name`='"+req.body.fname+"',`last_name`='"+req.body.lname+"',`userid`='"+req.session.userid+"',`password`='"+pass+"',`email`='"+req.body.email+"' WHERE userid='"+req.session.userid+"'", function (err, result1, fields) {
            if (err) throw err; 
            res.render("profile.ejs",{inout:"logout", info:  JSON.parse(JSON.stringify(result)),userid: req.session.userid,message:"done"}); 
          }) 
        }
    })
     }
    else{ 
      return res.render("profile.ejs",{inout:"login", info: "no login history",userid: "Guest",message:""}); 
    }
    
})
var fromd="";
var tod="";
var a=[];
var b=[];
var c=[];
app.get('/bookcar', async(req, res) =>
{ 
    fromd = new Date(req.query.fromdate+" "+req.query.appt);  
    tod = new Date(req.query.todate+" "+req.query.appt1);  
     var diff= tod - fromd
     var dif=Math.ceil(diff / (1000*3600*24));
      b.push(dif);
      if(dif>0)
      {
      var fdate=fromd.getHours()+":"+fromd.getMinutes();
      var fdate1=fromd.toLocaleString('en-us',{month:'long', year:'numeric', day:'numeric'})+" "+fdate
      var tod1=tod.getHours()+":"+tod.getMinutes();
      var tod2=tod.toLocaleString('en-us',{month:'long', year:'numeric', day:'numeric'})+" "+tod1
      if(fromd == '' && tod == '')
      {   
        return res.render("home.ejs",{inout:"login", info: "no login history",userid: "Guest",message: "Please Enter dates"});
      }
      else{
      a.push(fromd,tod); 
      connection.query("SELECT * FROM `cars` order by day_price", function (err, rows, fields) {
        if (err != null) {
          console.error(err)
          res.sendStatus(500);
        }
         else 
         {
            if(rows.length>0)
            {
              if(req.session.userid)
              {
                connection.query("SELECT * FROM `log_history` WHERE  userid='"+req.session.userid+"' order by timestamp desc LIMIT 8;", function (err, result, fields) {
                  if (err) throw err; 
                  else{
                    return res.render("bookcar.ejs",{inout:"logout", info: fdate1+" => "+tod2 +" Number of days "+dif,userid: req.session.userid, cars:JSON.parse(JSON.stringify(rows))});
                  }
                })
              }
              else
              {
                return res.render("bookcar.ejs",{inout:"login", info: fdate1+" => "+tod2 +" Number of days "+dif,userid: "Guest", cars:JSON.parse(JSON.stringify(rows))});
              }
            }    
         }  
        })
      }
      }
      else{
        return res.render("home.ejs",{inout:"login", info: "no login history",userid: "Guest",message: "Please pick correct dates"}); 
      }

 })

var id;
var price;
var d=[];
app.get('/bookinfo:id', async(req, res) =>
{ 
  id= req.params.id;
  id=id.substring(1);
  d.push(id);
    if(req.session.userid)
    {
      console.log(id);
      var len=a.length;

      connection.query("select * from cars where Carid='"+id+"'", function (err, result, fields) {
       if (err) throw err; 
       else
       {
         console.log("yes");
         var p=JSON.parse(JSON.stringify(result[0].day_price));
         price=p*b[(b.length)-1];
         c.push(price);
      console.log(price)
      console.log(a[len-2],a[len-1]);
      var refid=Math.floor(Math.random() * ( 999999-100000));
      var promc=""
      connection.query( "SELECT * FROM `promotion`  where userid='"+req.session.userid+"'", function (err, ans, fields) {
       if (err) throw err; 
       else
       { 
         if(ans.length>0)
         {
            promc= ans[0].code;
            if(ans[0].used != 0)
         {
           return res.render("promotion.ejs",{inout:"logout",prom:promc, info: "CAD $"+ price +" -- From ::"+a[len-2]+" -  To::"+a[len-1] ,userid: req.session.userid,message:  JSON.parse(JSON.stringify(result))});
         }
         else
         {
          return res.render("promotion.ejs",{inout:"logout",prom:"no", info: "CAD $"+ price +" -- From ::"+a[len-2]+" -  To::"+a[len-1] ,userid: req.session.userid,message:  JSON.parse(JSON.stringify(result))});
         }
         }
         else
         {
          return res.render("promotion.ejs",{inout:"logout",prom:"no", info: "CAD $"+ price +" -- From ::"+a[len-2]+" -  To::"+a[len-1] ,userid: req.session.userid,message:  JSON.parse(JSON.stringify(result))});
         }
         
         
       }
      })
     
     }
   }) 

     }
    else{ 
      return res.render("bookinfo.ejs",{inout:"login", info: "no login history",userid: "Guest",message: ""}); 
    } 
})

app.get('/history', async(req, res) =>
{ 
  if(req.session.userid)
  {
    connection.query( "SELECT * FROM `usercar_book` where userid='"+req.session.userid+"'", function (err, result, fields) {
      if (err) throw err; 
      return res.render("history.ejs",{inout:"logout",userid: "Logged in as :: "+req.session.userid,mes:  JSON.parse(JSON.stringify(result))});
    })
  }
  else{
    return res.render("history.ejs",{inout:"login",userid: "Login to view History",mes:  ""});
  }
})

app.post('/bookinfo', async(req, res) =>
{ 
    if(req.session.userid)
    {
      var ref_uid=Math.floor(Math.random() * ( 999999-100000));
      connection.query("SELECT * FROM `signup` WHERE  userid='"+req.session.userid+"'", function (err, result, fields) {
        if (err) throw err; 
        if(req.body.ve==='on')
        {
          connection.query( "SELECT * FROM `promotion`  where userid='"+req.session.userid+"'", function (err, ans, fields) {
            if (err) throw err; 
            var off;
            if(ans.length>0)
             {
               if(ans[0].used != 0)
               {
               off=ans[0].code.slice(-2);
               console.log("yes");
               off=off/100;
               console.log("price"+c[c.length-1])
               console.log(c[c.length-1]*off);
               connection.query( "INSERT INTO `usercar_book`(`userid`, `carid`, `price`, `before_dis`, `from_date`, `to_date`,`ref_num`) VALUES ('"+req.session.userid+"','"+d[d.length-1]+"','"+c[c.length-1]*off+"','"+c[c.length-1]+"','"+a[a.length-2]+"','"+a[a.length-1]+"','"+ref_uid+"')", function (err, ans, fields) {
                if (err) throw err;
                else{
                  connection.query("UPDATE `promotion` SET `used`=0 WHERE  userid='"+req.session.userid+"'", function (err, result, fields) {
                    if (err) throw err; 
                    else{
                        return res.render("ruack.ejs",{inout:"logout", info:"After Discount:: CAD $"+c[c.length-1]*off ,userid: req.session.userid,message: "Thank you  "+req.session.userid+" , Booking confirmation id ::"+ref_uid});
                    }
                  })
                }
                
               })
               }
              
             }
             else{
               connection.query( "INSERT INTO `usercar_book`(`userid`, `carid`, `price`, `before_dis`, `from_date`, `to_date`,`ref_num`) VALUES ('"+req.session.userid+"','"+d[d.length-1]+"','"+c[c.length-1]+"','"+c[c.length-1]+"','"+a[a.length-2]+"','"+a[a.length-1]+"','"+ref_uid+"')", function (err, ans, fields) {
                if (err) throw err;
                return res.render("ruack.ejs",{inout:"logout", info:"U dont have any promotion codes, Your final cost :: CAD $"+c[c.length-1] ,userid: req.session.userid,message: "Thank you  "+req.session.userid+" , Booking confirmation id ::"+ref_uid});
               })
             }
        })
         
        }
        else{
          connection.query( "INSERT INTO `usercar_book`(`userid`, `carid`, `price`, `before_dis`, `from_date`, `to_date`,`ref_num`) VALUES ('"+req.session.userid+"','"+d[d.length-1]+"','"+c[c.length-1]+"','"+c[c.length-1]+"','"+a[a.length-2]+"','"+a[a.length-1]+"','"+ref_uid+"')", function (err, ans, fields) {
            if (err) throw err;
            return res.render("ruack.ejs",{inout:"logout", info:"Your final cost :: CAD $"+c[c.length-1] ,userid: req.session.userid,message: "Thank you  "+req.session.userid+" , Booking confirmation id ::"+ref_uid});
           })
        }
    })
     }
    else{ 
      if(req.body.fname != '' && req.body.email != '' && req.body.phone != '' && id !='')
      {
             console.log(id)
             var len=a.length;
             var price;
             connection.query("select * from cars where Carid='"+id+"'", function (err, result, fields) {
              if (err) throw err; 
              else
              {
                var p=JSON.parse(JSON.stringify(result[0].day_price));
                price=p*b[(b.length)-2]
             console.log(price)
             console.log(a[len-2],a[len-1]);
             var refid=Math.floor(Math.random() * ( 999999-100000));
             connection.query("INSERT INTO `bookcar`(`carid`, `date_from`, `date_to`, `first_name`, `last_name`, `email`, `phone`, `refnum`,`price`) VALUES ('"+id+"','"+a[a.length-2]+"','"+a[a.length-1]+"','"+req.body.fname+"','"+req.body.lname+"','"+req.body.email+"','"+req.body.phone+"','"+refid+"','"+price+"')", function (err, result, fields) {
              if (err) throw err; 
              else
              {
                 return res.render("ack.ejs",{inout:"login", info: "",userid: "Guest",message: "Thank you "+req.body.fname+", Booking confirmation id "+refid+"."});
              }
             })
            }
          }) 
            
      }
     else{
      return res.render("bookinfo.ejs",{inout:"login", info: "Enter details",userid: "Guest",message: ""}); 
     }    
    }   
})


// Start the Express server
app.listen(3005, () => console.log('Server running on port 3005!'))