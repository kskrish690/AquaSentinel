const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database configuration:');
console.log('DB_HOST:', process.env.DB_HOST || 'MISSING');
console.log('DB_USER:', process.env.DB_USER || 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME || 'MISSING');
console.log('DB_PORT:', process.env.DB_PORT || 'MISSING');
console.log(
    'DB_PASSWORD:',
    process.env.DB_PASSWORD ? 'SET' : 'MISSING'
);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306
});

async function testDatabase() {

    try {

        const connection =
            await pool.getConnection();

        console.log(
            '✅ MySQL connected successfully'
        );

        connection.release();

    } catch (error) {

        console.error(
            '❌ MySQL connection failed'
        );

        console.error(
            'Error code:',
            error.code
        );

        console.error(
            'Error message:',
            error.message
        );

    }
}

testDatabase();

module.exports = pool;