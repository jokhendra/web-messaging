const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'TestDB',
  password: 'Aditya7452@#$%',
  port: 5432, // Default PostgreSQL port
});

// Connect to the PostgreSQL database


const connectDB = async () => {
  try {
    await client.connect();
    console.log('Connected to the PostgreSQL database');
  } catch (err) {
    console.error('Error connecting to the PostgreSQL database', err);
  }
};


module.exports = {connectDB,client};


// Execute a sample query
// client.query('SELECT * FROM your_table_name')
//   .then(result => console.log('Query result:', result.rows))
//   .catch(err => console.error('Error executing query', err))
//   .finally(() => {
//     // Close the client connection
//     client.end();
//   });