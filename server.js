var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bezariuz",
  database: "ioChatDB"
});
var userTemp = '';
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running');
app.use("/public", express.static(__dirname + "/public"));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

con.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});

io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected : %s sockets connected', connections.length);

  //Disconnectnya
  socket.on('disconnect', function (data) {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected : %s sockets connected', connections.length);
  });

  socket.on('ini pesan', function (data) {
    userTemp = data;
  });

  //sendMessage
  socket.on('send message', function (data) {
    console.log(data);
    io.sockets.emit('new message', {
      msg: data,
      user: socket.username,
      temp: userTemp
    });
    userTemp = '';
  });

  //new users
  socket.on('new user', function (username, password, callback) {
    var sql = "SELECT username, password, nickname FROM admins";
    con.query(sql, [username,password], function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username && password == result[i].password) {
          callback(result[i].nickname, true);
          socket.username = result[i].nickname;
          users.push(socket.username);
          updateUsernames();
          console.log('SUKSES');
          console.log(result);
          break;
        } else {
          callback(username, false);
          console.log('GAGAL');
        }
      }
    });
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
});