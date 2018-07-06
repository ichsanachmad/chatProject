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
  var currentNick = '';
  var currentUser = '';
  var isAdmin = false;
  var userId = '';

  //NEW CHAT
  socket.on('new message', function (data) {
    if (currentUser == data.temp) {
      $chat.append('<div class="chat-msg mb-2 px-3 py-2 bg-white">' + data.msg + '</div><br>');
      $chat.append('<div class="clear"></div>');
    } else {
      $chat.append('<div class="chat-msg mb-2 px-3 py-2 btn-primary float-left"><strong>' + data.user + ' : </strong> ' + data.msg + '</div><br>');
      $chat.append('<div class="clear"></div>');
    }
    autoScroll();
  });

  //LOGIN
  $loginForm.submit(function (e) {
    e.preventDefault();
    if (!isEmpty()) {
      socket.emit('login', $loginUsername.val(), $loginPassword.val(), function (title, user, nick, status) {
        if (status == true) {
          alert(title);
          currentUser = user;
          currentNick = nick;
          if (title == 'admins') {
            useAdminLayout();
            adminMenuOn();
            isAdmin = true;
          } else {
            useUserLayout();
            isAdmin = false;
          }
        } else {
          alert("User Not Found!");
        }
      });
    }
  });

  //REGISTER
  $registerForm.submit(function (e) {
    e.preventDefault();
    if (!isEmpty()) {
      socket.emit('register', $registerNickname.val(), $registerUsername.val(), $registerPassword.val(), function (status) {
        if (status) {
          $registerNickname.val('');
          $registerUsername.val('');
          $registerPassword.val('');
          alert("Register Successfully");
        } else {
          alert("Username already taken!");
        }
      });
    }
  });

  //SHOW USER
  socket.on('get users', function (data) {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      if (data) {
        html += '<li class="list-group-item" id="user' + i + '">' + data[i] + '</li>';
      }
    }
    $users.html(html);
  });

  //SEND MESSAGE
  $messageForm.submit(function (e) {
    e.preventDefault();
    socket.emit('ini pesan', currentUser);
    socket.emit('send message', $message.val());
    $message.val('');
  });

  $("#message").keypress(function (e) {
    if (e.which == 13 && !e.shiftKey) {
      $(this).closest("form").submit();
      e.preventDefault();
      return false;
    }
  });

  $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
    var id = $(this).data("id");
    currentTab = id;
  });

  //REGISTER ALERT
  $(document).ready(function () {
    $('#reg-nickname').popover({
      content: "Minimum 6 characters",
      trigger: "focus"
    });
    $('#reg-username').popover({
      content: "Minimum 6 characters",
      trigger: "focus"
    });
    $('#reg-password').popover({
      content: "Minimum 8 characters",
      trigger: "focus"
    });
  });

  $('body').click(function () {
    $('#adminMenu').click(function () {
      return false;
    })
    $('#adminMenu').fadeOut();
  });

  //SHOW ADMIN MENU
  $(function () {
    $('ul').on('contextmenu', 'li', function (e) {
      e.preventDefault();
      if (isAdmin && ($(this).text() != currentNick)) {
        userId = getIndex(document.getElementById(this.id));
        $('#adminMenu').css({
          "position": "absolute",
          "z-index": "5"
        }).fadeIn().offset({
          top: e.pageY,
          left: e.pageX
        });
      }
    });
  });

  //LOGOUT
  $('#userLogout').on('click', function () {
    location.reload();
  });

  //KICK USER
  function kickUser() {
    socket.emit('kick', userId);
  }

  function adminMenuOn() {
    $('#mute').on('click', function () {
      alert('MUTE');
      $('#adminMenu').fadeOut();
    });
    $('#kick').on('click', function () {
      alert('KICK');
      kickUser();
      $('#adminMenu').fadeOut();
    });
    $('#ban').on('click', function () {
      alert('BAN');
      $('#adminMenu').fadeOut();
    });
    $('#delete').on('click', function () {
      alert('DELETE');
      $('#adminMenu').fadeOut();
    });
  }

  function getIndex(child) {
    var parent = child.parentNode;
    var i = parent.children.length - 1;
    for (; i >= 0; i--) {
      if (child == parent.children[i]) {
        break;
      }
    }
    return i;
  };

  function useAdminLayout() {
    $userFormArea.hide();
    $my3.show();
    $userLogout.show();
    $messageArea.show();
    $('#firstHeader').hide();
    $('#firstHeaderH4').hide();
    $('.well').append('<div class="btn-group-vertical" id="adminMenu" style="display: none;"></div>');
    $('#adminMenu').append('<button type="button" class="btn btn-warning" id="mute" style="width:107.52; height:149;">Mute User</button>');
    $('#adminMenu').append('<button type="button" class="btn btn-success" id="kick" style="width:107.52; height:149;">Kick User</button>');
    $('#adminMenu').append('<button type="button" class="btn btn-danger" id="ban" style="width:107.52; height:149;">Ban User</button>');
    $('#adminMenu').append('<button type="button" class="btn btn-dark" id="delete" style="width:107.52; height:149;">Delete User</button>');
  }

  function useUserLayout() {
    $userFormArea.hide();
    $my3.show();
    $userLogout.show();
    $messageArea.show();
    $('#firstHeader').hide();
    $('#firstHeaderH4').hide();
  }
});

var currentTab = 'signin';

function autoScroll() {
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight;
}

function showTime() {
  var d = new Date();
  return d.getHours() + '.' + (d.getMinutes() < 10 ? 0 : '') + d.getMinutes();
}

function isEmpty() {
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
    if (regUser.value.trim() != '' && regUser.value.trim().length >= 6) {
      regUser.style.borderColor = "#ced4da";
    }
    if (regPass.value.trim() != '' && regPass.value.trim().length >= 8) {
      regPass.style.borderColor = "#ced4da";
    }
    if (regNick.value.trim() != '' && regNick.value.trim().length >= 6) {
      regNick.style.borderColor = "#ced4da";
    }

    if ((regUser.value.trim() == '' || regUser.value.trim().length < 6) &&
      (regPass.value.trim() == '' || regPass.value.trim().length < 8) &&
      (regNick.value.trim() == '' || regNick.value.trim().length < 6)) {

      regUser.style.borderColor = "#FF0000";
      regPass.style.borderColor = "#FF0000";
      regNick.style.borderColor = "#FF0000";
      return true;
    } else if (regUser.value.trim() == '' || regUser.value.trim().length < 6) {
      regUser.style.borderColor = "#FF0000";
      return true;
    } else if (regPass.value.trim() == '' || regPass.value.trim().length < 8) {
      regPass.style.borderColor = "#FF0000";
      return true;
    } else if (regNick.value.trim() == '' || regNick.value.trim().length < 6) {
      regNick.style.borderColor = "#FF0000";
      return true;
    }
    return false;
  }
}