const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const users = require('./users')();

const message = (name, text, id) => ({name, text, id});

app.use(express.static(publicPath));

io.on("connection", socket => {

  socket.on("join", (user, callback) => {
    if(!user.name || !user.room) {
      return callback("Enter valid user data")
    }

    callback({userId: socket.id})

    socket.join(user.room);

    socket.emit("message:new", message("Admin", `Welcome, ${user.name}`));
    socket.broadcast.to(user.room).emit("message:new", message("Admin", `${user.name}, joined.`))
  })

  socket.on("message:create", (data, callback) => {
    if (!data) {
      callback(`Message can't be empty`);
    } else {
      const user = users.get(socket.id);
      if(user) {
        io.to(user.room).emit('message:new', message(data.name, data.text, data.id));
      }
      callback();
    }
  })
})

server.listen(PORT, () => console.log(`Server Running On Port PORT ${PORT}`));