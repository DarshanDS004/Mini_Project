const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed!');
    console.error('Error:', err.message);
    console.error('');
    console.error('Please check:');
    console.error('  1. MySQL is running (run: net start MySQL80)');
    console.error('  2. DB_PASSWORD in .env file is correct');
    console.error('  3. Database "mindcare_india" exists');
    console.error('');
  } else {
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to: ${process.env.DB_NAME}`);
    connection.release();
  }
});

// Export promise-based pool for async/await
module.exports = pool.promise();
