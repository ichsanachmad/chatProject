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
        $chat.append('<div class="chat-msg mt-2 mr-2" style="text-align:right">' + data.msg + '</div>');
      } else {
        $chat.append('<div class="chat-msg"><strong>' + data.user + ' : </strong> ' + data.msg + '</div>');
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
      socket.emit('new user', $username.val(), function (data) {
        if (data) {
          $userFormArea.hide();
          $userLogout.show();
          $messageArea.show();
          $('#firstHeader').hide();
          $('#firstHeaderH4').hide();
          currentUser = data;
        }
        else {
          $messageArea.hide();
          window.alert("Invalid Username");
          location.reload();
        }
      });
      $username.val('');
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
