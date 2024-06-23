// app.js
const express = require('express');
const app = express();
const cors = require('cors');
// import { globalErrorHandler} from './utils/errorController.js';
// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const {client} = require('./db/index.pg.js');
// app.set("io",io);

app.route('/').get((req,res)=>{
  client.query('SELECT * FROM cars')
  .then(result => res.json(result.rows))
  .catch(err => console.error('Error executing query', err))
  .finally(() => {
    // Close the client connection
    // client.end();
  });
})




app.all('*',(req,res,next)=>{
  const err=new Error(`Can't find ${req.originalUrl} on this server`);
  err.status='fail';
  err.statusCode=404;
  next(err);
}) // This is the catch all route handler

// app.use(globalErrorHandler); // This is the error handler middleware

module.exports = app;
