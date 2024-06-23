// socket.js
const { Server } = require("socket.io");
let io = null;
function configureSocket(server) {
  const socketServer = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  });

  io = socketServer.of("/socket");
  const connectedUsers = new Map();
  let users_info = [];
  const sockets = new Map();
  let messages = {};
  io.on("connection", async (socket) => {
    const username = socket.handshake.query.username;
    let UserId = Math.floor(100000 + Math.random() * 900000);
    while(connectedUsers.has(UserId)){
      UserId = Math.floor(100000 + Math.random() * 900000);
    }
    // send UserId to the new user conneted user only send to new user
    io.to(socket.id).emit("your-id", UserId);
    
    connectedUsers.set(UserId, socket.id);
    connectedUsers.delete(null);
    // socket.emit("connected-users", users_info);
    io.to(socket.id).emit("connected-users", users_info);
    users_info.push({userId:UserId,username:username}); 
    // console.log(users_info);
    sockets.set(socket.id, UserId);
    // console.log(connectedUsers,users_info);
    // inform all clients about the new user and if new user is connected then also inform about previous users
    socket.broadcast.emit("user-connected", {userId:UserId,username:username});
    
    socket.on('update-to-user',({from,to,username})=>{
      let fromusersocket = connectedUsers.get(from);
      // let tousersocket = connectedUsers.get(to);
      if(fromusersocket){
        io.to(fromusersocket).emit('update-to-user',to);
      }
    })

    socket.on('update-message-status',(data)=>{
      let onekey = `${data.to}-${data.from}`;
      let otherkey = `${data.from}-${data.to}`;
      if(onekey in messages){
        messages[onekey].forEach((msg) => {
          if(msg.msgId === data.msgId){
            msg.read = data.read;
            msg.delivered = data.delivered;
            // check if to user is connected then send message status
          }
        })
      }else{
        messages[otherkey].forEach((msg) => {
          if(msg.msgId === data.msgId){
            msg.read = data.read;
            msg.delivered = data.delivered;
          }
        })
      }
      let socketId = connectedUsers.get(data.from);
      if(socketId){
        io.to(socketId).emit('update-message-status',data);
      }
    })

    socket.on('message', (payload,callback) => {
      // Broadcast message to all other clients except sender
      let {message,to,from,read} = payload;
      let socketId = connectedUsers.get(to);
      let onekey = `${to}-${from}`;
      let otherkey = `${from}-${to}`;
      if((!(onekey in messages)) && (!(otherkey in messages))){
        messages[onekey]=[{message,to,from,read,timeStamp:Date.now(),msgId:payload.msgId,delivered:false,isServerReceived:true}];
      }else{
        if(onekey in messages){
          messages[onekey].push({message,to,from,read,timeStamp:Date.now(),msgId:payload.msgId,delivered:false,isServerReceived:true});
        }else{
          messages[otherkey].push({message,to,from,read,timeStamp:Date.now(),msgId:payload.msgId,delivered:false,isServerReceived:true});
        }
      }
      if(socketId){
        io.to(socketId).emit('message', {message,from ,to,read,timeStamp:Date.now(),msgId:payload.msgId});
      }
      callback(payload.msgId)
    });

    socket.on('get-old-messages',({from,to})=>{
      let onekey = `${to}-${from}`;
      let otherkey = `${from}-${to}`;
      // console.log(from,to);
      let fromsocket = connectedUsers.get(to);
      if((onekey in messages)){
        // console.log(messages[onekey],"💕💕💕🌿🌿");
        // to message to read status true
        messages[onekey]?.forEach((msg) => {
          if(msg.read === false,msg.to == to){
            msg.read = true;
            let socketId = connectedUsers.get(from);
            if(socketId){
              io.to(socketId).emit('confirm-read',{from,to,msgId:msg.msgId});
            }
          }
        })
        if(fromsocket)
          io.to(fromsocket).emit('get-old-messages',messages[onekey]||[]);
        return;
      }else{
        messages[otherkey]?.forEach((msg) => {
          if(msg.read === false,msg.to == to){
            msg.read = true;
            let socketId = connectedUsers.get(from);
            if(socketId){
              io.to(socketId).emit('confirm-read',{from,to,msgId:msg.msgId});
            }
          }
        })
        io.to(fromsocket).emit('get-old-messages',messages[otherkey]||[]);
        return;
      }
    })

    socket.on('audio-call',({from,to,username})=>{
      let tosocket = connectedUsers.get(to);
      if(tosocket){
        io.to(tosocket).emit('audio-call',{from,username});
      }
    })

    socket.on("call-accepted",({from,status})=>{
      let socketId = connectedUsers.get(from);
      if(socketId)
        io.to(socketId).emit("call-accepted",status)
    })

    socket.on('reject-call',({from,to,username})=>{
      let socketId = connectedUsers.get(to);
      if(socketId)
        io.to(socketId).emit("reject-call",{});
    })

    socket.on('end-call',({from,to,username})=>{
      let socketId = connectedUsers.get(to);
      if(socketId)
        io.to(socketId).emit("end-call",{});
    })

    // TODO: Typing event
    socket.on('typing',({from,to})=>{
      let socketId = connectedUsers.get(to);
      if(socketId)
        io.to(socketId).emit('typing',{from});
    })

    socket.on('offer', ({offer,to}) => {
      // Broadcast offer to all other clients except sender
      let socketId = connectedUsers.get(to);
      if(socketId)
        io.to(socketId).emit('offer', offer);
      // socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', ({answer,to}) => {
        // Broadcast answer to all other clients except sender
        let socketId = connectedUsers.get(to);
        if(socketId)
          io.to(socketId).emit('answer', answer);
        // socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', ({candidate,to}) => {
        // Broadcast ICE candidate to all other clients except sender
        let socketId = connectedUsers.get(to);
        if(socketId)
          io.to(socketId).emit('ice-candidate', candidate);

        // socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', (resone) => {
      // console.log("user disconnected",UserId);
      let UserId = sockets.get(socket.id);
      // console.log(UserId);
      connectedUsers.delete(UserId);
      users_info = users_info.filter((user) => user.userId !== UserId);
      sockets.delete(socket.id);
      // console.log(users_info);
      socket.broadcast.emit("user-disconnected", UserId);
    });
  });
}

module.exports = { configureSocket, io};
