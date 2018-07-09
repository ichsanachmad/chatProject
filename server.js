var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var mailer = require('nodemailer');
var fs = require('fs');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bezariuz",
  database: "ioChatDB"
});
var userNick = [];
var userName = [];
var connections = [];
var idTemp = [];
var listMuted = [];
var userTemp = '';
var isKicked = false;

server.listen(process.env.PORT || 3000);
console.log('Server running');
app.use("/public", express.static(__dirname + "/public"));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/feedback', function (req, res) {
  res.sendFile(__dirname + '/feedback.html');
});

con.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});

io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected : %s sockets connected', connections.length);

  //Disconnectnya
  socket.on('disconnect', function () {
    userName.splice(idTemp.indexOf(socket.id), 1);
    idTemp.splice(idTemp.indexOf(socket.id), 1);
    userNick.splice(userNick.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected : %s sockets connected', connections.length);
    if (!isKicked) {
      socket.broadcast.emit('user out', {
        username: socket.username
      });
    }
    isKicked = false;
  });

  socket.on('temp', function (data) {
    userTemp = data;
  });

  //Kick User
  socket.on('kick', function (data) {
    if (io.sockets.connected[idTemp[data]]) {
      io.sockets.emit('announce', {
        announceMsg: userNick[data] + ' has been kicked!',
        victim: userName[data]
      });
      isKicked = true;
      console.log(userNick[data] + ' has been kicked!');
      io.sockets.connected[idTemp[data]].disconnect();
    }
  })

  //Mute User
  socket.on('mute', function (data) {
    listMuted.push(userName[data]);
    console.log('MUTE : ' + userName[data]);
  })

  //Unmute User
  socket.on('unmute', function (data) {
    listMuted.splice(listMuted.indexOf(userName[data]), 1);
    console.log('UNMUTE : ' + userName[data]);
  })

  //Send Message
  socket.on('send message', function (nick, user, data) {
    var status = false;
    var muteName = '';
    for (var i = 0; i < listMuted.length; i++) {
      if (user == listMuted[i]) {
        status = true;
        muteName = user;
      }
    }
    io.sockets.emit('new message', {
      msg: data,
      user: socket.username,
      temp: userTemp,
      isMuted: status,
      mutedName: muteName
    });
    console.log(nick + ' : ' + data);
    userTemp = '';
  });

  //Login
  socket.on('login', function (username, password, callback) {
    accountLogin(username, password, function (account, uname, nick, result) {
      callback(account, uname, nick, result);
    });
  });

  //Register
  socket.on('register', function (nickname, username, password, callback) {
    registerUser(nickname, username, password, function (result) {
      callback(result);
    });
  });

  //Report Bug
  socket.on('send email', function (judul, isi, callback) {
    var transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bot.sanstation@gmail.com',
        pass: 'sanstation123'
      }
    });

    var mailTarget = {
      from: 'bot.sanstation@gmail.com',
      to: 'bot.adsanstation@gmail.com',
      subject: '[REPORT-SANSTATION] - ' + judul,
      text: isi
    };

    transporter.sendMail(mailTarget, function (error, info) {
      if (error) {
        console.log(error);
        callback(false);
      } else {
        console.log('Ada Yang Mengirim Email Report! ' + info.response);
        callback(true);
      }
    });
  });

  function accountLogin(username, password, callback) {
    var sql = "SELECT username, password, nickname FROM admins";
    con.query(sql, function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username && password == result[i].password) {
          socket.username = result[i].nickname;
          userNick.push(socket.username);
          userName.push(username);
          idTemp.push(socket.id);
          updateUsernames();
          console.log('Admins ' + username + ' has logged in');
          socket.broadcast.emit('user joined', {
            username: socket.username
          });
          return callback('admins', result[i].username, result[i].nickname, true);
        } else {
          if (i == (result.length - 1)) {
            sql = "SELECT username, password, nickname FROM users";
            con.query(sql, function (err, result) {
              if (err) throw err;
              for (var i = 0; i < result.length; i++) {
                if (username == result[i].username && password == result[i].password) {
                  socket.username = result[i].nickname;
                  userNick.push(socket.username);
                  userName.push(username);
                  idTemp.push(socket.id);
                  updateUsernames();
                  console.log('Users ' + username + ' has logged in');
                  socket.broadcast.emit('user joined', {
                    username: socket.username
                  });
                  return callback('users', result[i].username, result[i].nickname, true);
                } else {
                  if (i == (result.length - 1)) {
                    console.log('Failed to login');
                    return callback('', false);
                  }
                }
              }
            });
          }
        }
      }
    });
  }

  function registerUser(nickname, username, password, callback) {
    var sqlCheck = "SELECT username FROM users";
    con.query(sqlCheck, function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username) {
          console.log('Username is Taken');
          return callback(false);
        } else {
          if (i == (result.length - 1)) {
            var sqlRegister = "INSERT INTO users (username, password, nickname) VALUES ?";
            var values = [
              [username, password, nickname]
            ];
            con.query(sqlRegister, [values], function (err, result) {
              if (err) throw err;
              console.log(username + ' has Successfully Registered');
            });
            return callback(true);
          }
        }
      }
    });
  }

  function updateUsernames() {
    io.sockets.emit('get users', userNick);
  }
});