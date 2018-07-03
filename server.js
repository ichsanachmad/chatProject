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
var output = false;
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

  //Login
  socket.on('login', function (username, password, callback) {
    var sql = "SELECT username, password, nickname FROM users";
    con.query(sql, function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username && password == result[i].password) {
          callback(result[i].nickname, true);
          socket.username = result[i].nickname;
          users.push(socket.username);
          updateUsernames();
          console.log(username + ' has logged in');
          break;
        } else {
          if (i == (result.length - 1)) {
            callback('', false);
            console.log('Failed to login');
          }
        }
      }
    });
  });

  //Register
  socket.on('register', function (nickname, username, password, callback) {
    var sqlCheck = "SELECT username FROM users";
    con.query(sqlCheck, function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username) {
          console.log('Username is Taken');
          callback(false);
        } else {
          if (i == (result.length - 1)) {
            var sqlRegister = "INSERT INTO users (username, password, nickname) VALUES ?";
            var values = [[username, password, nickname]];
            con.query(sqlRegister, [values], function (err, result) {
              if (err) throw err;
              console.log(username + ' has Successfully Registered');
            });
            callback(true);
          }
        }
      }
    });
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
});