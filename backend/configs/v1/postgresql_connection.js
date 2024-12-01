const Pool = require("pg").Pool;

const conn = new Pool({
    host: 'localhost:8888',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'postgres'
});

conn.connect((err) => {
    if (err) {
        console.log("Error!!!", err.message);
    } else {
        console.log("Success!!! PostgreSQL Database has been connected");
    }
});

module.exports = conn;