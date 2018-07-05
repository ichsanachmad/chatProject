$(function () {
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $loginForm = $('#loginForm');
    var $registerForm = $('#registerForm');
    var $userFormArea = $('#userFormArea');
    var $users = $('#users');
    var $loginUsername = $('#login-username');
    var $loginPassword = $('#login-password');
    var $registerUsername = $('#reg-username');
    var $registerPassword = $('#reg-password');
    var $registerNickname = $('#reg-nickname');
    var $userLogout = $('#userLogout');
    var $my3 = $('#my-3');
    var currentUser = '';
    var $bugReport = $('#bugReport');
    var $judulBug = $('#judulBug');
    var $rincianBug = $('#rincianBug');

    $messageForm.submit(function (e) {
      e.preventDefault();
      if($message.val()!=''){
        socket.emit('ini pesan', currentUser);
        socket.emit('send message', $message.val(),function(data){
          //stuff
        });
        $message.val('');
      }
      else{
         
      }
      
    });

    // socket.on('whisper',function(data){
    //   if (currentUser == data.temp) {
    //     $chat.append('<div class="chat-msg mb-2 px-3 py-2 bg-white">'+ data.msg + '</div><br>');
    //   } else {
    //     $chat.append('<div class="chat-msg mb-2 px-3 py-2 btn-primary receiver clear"><strong>' + data.user + ' : </strong> ' + data.msg + '</div><br>');
    //   }
    //   autoScroll();
    // });

    socket.on('new message', function (data) {
      if (currentUser == data.temp) {
        $chat.append('<div class="chat-msg mb-2 px-3 py-2 bg-white">'+ data.msg + '</div><br>');
      } else {
        $chat.append('<div class="chat-msg mb-2 px-3 py-2 btn-primary receiver clear"><strong>' + data.user + ' : </strong> ' + data.msg + '</div><br>');
      }
      autoScroll();
    });

    $("#message").keypress(function (e) {
      if (e.which == 13 && !e.shiftKey) {
        $(this).closest("form").submit();
        e.preventDefault();
        return false;
      }
    });

    $loginForm.submit(function (e) {
      e.preventDefault();
      if (!isEmpty()) {
        socket.emit('login', $loginUsername.val(), $loginPassword.val(), function (data, status) {
          if (status == true) {
            alert("You Logged In as "+data);
            $userFormArea.hide();
            $my3.show();
            $userLogout.show();
            $messageArea.show();
            $('#firstHeader').hide();
            $('#firstHeaderH4').hide();
            currentUser = data;

            socket.on('user joined', (data) => {
              $chat.append('<center><div class="chat-msg mb-2 px-3 py-2 bg-white">'+ data.username + ' JOINED</div></center><br>');
              autoScroll();
             });

          }
          else {
            alert("User Not Found!");
          }
        });
      }
    });

    socket.on('user out', (data) => {
      $chat.append('<center><div class="chat-msg mb-2 px-3 py-2 bg-white">'+ data.username + ' Logged Out</div></center><br>');
      autoScroll();
    });

    $registerForm.submit(function (e) {
      e.preventDefault();
      if (!isEmpty()) {
        socket.emit('register', $registerNickname.val(), $registerUsername.val(), $registerPassword.val(), function (status) {
          if (status) {
            $registerNickname.val('');
            $registerUsername.val('');
            $registerPassword.val('');
            alert("Register Successfully");
          }
          else {
            alert("Username already taken!");
          }
        });
      }
      
    });

    //REPORT FOR BUG
    $bugReport.submit(function(e){
      e.preventDefault();
      socket.emit('send email', $judulBug.val(),$rincianBug.val(), function(data){
        if(data){
          alert("Laporan Sudah Dikirim (^_^)");
        }else{
          alert("Mohon Maaf Server Kami Sedang Gangguan");
        }
      });
    });

    socket.on('get users', function (data) {
      var html = '';
      for (var i = 0; i < data.length; i++) {
        if (data) {
          html += '<li class="list-group-item">' + data[i] + '</li>'
            ;
        }
      }
      $users.html(html);
    });

    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
      $('a[data-toggle="pill"]').removeClass("active");
      $(this).addClass("active");
      var id = $(this).data("id");
      currentTab = id;
    });
  });
  
  var currentTab = 'signin';

  function autoScroll() {
    var elem = document.getElementById('chat');
    elem.scrollTop = elem.scrollHeight;
  }

  function userLogout() {
    
    location.reload();
   
  }

  function showTime() {
    var d = new Date();
    return d.getHours() + '.' + (d.getMinutes()<10?0:'') + d.getMinutes();
  }

  function isEmpty(){
    var loginUser = document.getElementById('login-username');
    var loginPass = document.getElementById('login-password');
    var regUser = document.getElementById('reg-username');
    var regPass = document.getElementById('reg-password');
    var regNick = document.getElementById('reg-nickname');

    if (currentTab == 'signin') {
      if (loginUser.value.trim() != '') {
        loginUser.style.borderColor = "#ced4da";
      } else if (loginPass.value.trim() != '') {
        loginPass.style.borderColor = "#ced4da";
      }

      if (loginUser.value.trim() == '' && loginPass.value.trim() == '') {
        loginUser.style.borderColor = "#FF0000";
        loginPass.style.borderColor = "#FF0000";
        return true;
      } else if (loginUser.value.trim() == '') {
        loginUser.style.borderColor = "#FF0000";
        return true;
      } else if (loginPass.value.trim() == '') {
        loginPass.style.borderColor = "#FF0000";
        return true;
      }
      return false;
    } else {
      if (regUser.value.trim() != '') {
        regUser.style.borderColor = "#ced4da";
      } else if (regPass.value.trim() != '') {
        regPass.style.borderColor = "#ced4da";
      } else if (regNick.value.trim() != '') {
        regNick.style.borderColor = "#ced4da";
      }

      if (regUser.value.trim() == '' && regPass.value.trim() == '' && regNick.value.trim() == '') {
        regUser.style.borderColor = "#FF0000";
        regPass.style.borderColor = "#FF0000";
        return true;
      } else if (regUser.value.trim() == '') {
        regUser.style.borderColor = "#FF0000";
        return true;
      } else if (regPass.value.trim() == '') {
        regPass.style.borderColor = "#FF0000";
        return true;
      } else if (regNick.value.trim() == '') {
        regNick.style.borderColor = "#FF0000";
        return true;
      }
      return false;
    }
  }