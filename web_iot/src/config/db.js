const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "12345",
  database: "data_sensor",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("MySQL connected");
});

module.exports = con;
