$(function () {
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $userForm = $('#userForm');
    var $userFormArea = $('#userFormArea');
    var $users = $('#users');
    var $username = $('#username');
    var $password = $('#password');
    var $userLogout = $('#userLogout');
    var currentUser = '';

    $messageForm.submit(function (e) {
      e.preventDefault();
      socket.emit('ini pesan', currentUser);
      socket.emit('send message', $message.val());
      $message.val('');
    });

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

    $userForm.submit(function (e) {
      e.preventDefault();
      if (!isEmpty()) {
        socket.emit('new user', $username.val(), $password.val(), function (data, status) {
          if (status == true) {
            alert(data);
            $userFormArea.hide();
            $userLogout.show();
            $messageArea.show();
            $('#firstHeader').hide();
            $('#firstHeaderH4').hide();
            currentUser = data;
          }
          else {
            window.alert("User Not Found!");
          }
        });
      }
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
  });

  function autoScroll() {
    var elem = document.getElementById('chat');
    elem.scrollTop = elem.scrollHeight;
  }

  function userLogout() {
    location.reload();
  }

  function hideElement() {
    document.getElementById('messageArea').style.display = "none";
  }

  function showTime() {
    var d = new Date();
    return d.getHours() + '.' + (d.getMinutes()<10?0:'') + d.getMinutes();
  }

  function isEmpty(){
    var user = document.getElementById('username');
    var pass = document.getElementById('password');

    if (user.value.trim() != '') {
      user.style.borderColor = "#ced4da";
    } else if (pass.value.trim() != '') {
      pass.style.borderColor = "#ced4da";
    }

    if (user.value.trim() == '' && pass.value.trim() == '') {
      user.style.borderColor = "#FF0000";
      pass.style.borderColor = "#FF0000";
      return true;
    } else if (user.value.trim() == '') {
      user.style.borderColor = "#FF0000";
      return true;
    } else if (pass.value.trim() == '') {
      pass.style.borderColor = "#FF0000";
      return true;
    }
    return false;
  }