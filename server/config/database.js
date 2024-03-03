const database = require('mysql');

const db_connection = database.createConnection({
    host:'localhost',
    port:3306,
    user:'seophohoho',
    password:'seophohoho',
    database:'poposeop'
});

module.exports = db_connection;