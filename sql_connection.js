var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port : 3306,
    database:'car_rental'
});
connection.connect(function(err) {
  if (err) throw err;
  else{
      console.log("Connected!");
     }
});

module.exports = connection;