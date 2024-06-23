// Main index.js
const http = require('http');
const app = require('./app.js');
const fs = require('fs');
const {configureSocket} = require('./socket.js');
const {connectDB} = require('./db/index.pg.js');
require('dotenv').config();
// const https_options = {
//    key: fs.readFileSync("./keys/private.key"),
//    cert: fs.readFileSync("./keys/certificate.crt"),
//    ca: [
//    fs.readFileSync('./keys/ca_bundle.crt')
//    ]
//    };
const server = http.createServer(app);
// Configure Socket.IO
configureSocket(server);
const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
  server.listen(PORT, () => {
    console.log(`⚙️Server is running on http://127.0.0.1:${PORT}`);
  });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
