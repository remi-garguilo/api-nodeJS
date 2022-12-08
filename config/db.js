var mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'api-nodejs',
    port: 8889
});

module.exports = con;