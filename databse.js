const mysql = require("mysql");

const con = mysql
.createConnection({
    host: "localhost", // HOST NAME
    user: "root", // USER NAME
    database: "blockchain_sender", // DATABASE NAME
    password: "root", // DATABASE PASSWORD
})
  .on("error", (err) => {
      console.log("Failed to connect to Database - ", err);
    });
    // console.log(db);
    // }
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

module.exports = con;