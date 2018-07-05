var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var mailer =  require('nodemailer');
var fs = require('fs');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "iochat"
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

app.get('/feedback',function(req,res){
  res.sendFile(__dirname+'/feedback.html');
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
    
    socket.broadcast.emit('user out', {
      username: socket.username
    });
    
  });

  socket.on('ini pesan', function (data) {
    userTemp = data;
  });

  //sendMessage
  socket.on('send message', function (data,callback) {
      // var msg = data.trim();
      // var whispUser='';
      // if(msg.substr(0,3) === '/w '){
      //   msg = msg.substr(3);
      //   var ind = msg.indexOf(' ');
      
      //   if(ind != -1){
      //     console.log('ini whisper 2');
      //       var name = msg.substring(0, ind);
      //       var msgTemp =  msg.substring(ind + 1);
      //       for(var i =0 ; i<users.length;i++){
      //         if(name==users[i]){
      //           socket.emit('whisper', {
      //             msg: msgTemp,
      //             user: socket.username,
      //             temp: userTemp
      //           });
      //           callback(msg);  
      //           userTemp = '';
      //           console.log('ini whisper 3');
      //           break;
      //         }else{
      //           console.log('ini salah');
      //           console.log(name);
      //           console.log(users);
      //           console.log();
      //           break;
                
      //         }
      //       }  
      //   }else{
      //     callback('error, silahkan masukan pesan whisper');
      //   }
        
      // }else{
        io.sockets.emit('new message', {
          msg: data,
          user: socket.username,
          temp: userTemp
        });
        userTemp = '';
      // }
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
          socket.broadcast.emit('user joined', {
            username: socket.username
          });
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

 //logout
 

  //Register
  socket.on('register', function (nickname, username, password, callback) {
    var sqlCheck = "SELECT username FROM users";
    con.query(sqlCheck, function (err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        if (username == result[i].username) {
          console.log('Username is Taken');
          callback(false);
        }else if(nickname==result[i].nickname){
          console.log('Nickname is Taken');
          callback(false);
        }else{
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

  //Mailer For Report Bug/User
  socket.on('send email',function(judul,isi,callback){
    var transporter =  mailer.createTransport({
      service:'gmail',
      auth:{
        user:'bot.sanstation@gmail.com',
        pass:''
      }

    });

    var mailTarget ={
      from:'bot.sanstation@gmail.com',
      to:'bot.adsanstation@gmail.com',
      subject:'[REPORT-SANSTATION] - '+judul,
      text:isi
    };

    transporter.sendMail(mailTarget, function(error,info){
      if(error){
        console.log(error);
        callback(false);
      }else{
        console.log('Ada Yang Mengirim Email Report! ' +info.response);
        callback(true);
      }
    });
    
    
  });
  //====================================================
  
  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
});