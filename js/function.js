function init_login(socket){
	// when user clicks 'Register'
	$('#register').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('#password').val();
		$('#username').val('');
		$('#password').val('');
		
		socket.emit('register', {username: username, password: password});
		socket.on('registersuccess', function(message){
			$('#login_text').text(message);
			console.log(message);
		});
		
		socket.on('registerfail', function(message){
			$('#login_text').text(message);
			console.log(message);
		});
	});
	
	// when user clicks 'Login'
	$('#login').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('#password').val();
		$('#username').val('');
		$('#password').val('');
		
		socket.emit('login', {username: username, password: password});
		socket.on('loginsuccess', function(data){
			document.cookie = "sessionid=" + data.sessionid.toString() + "; expires=" + data.expires.toUTCString() + ";";
			document.cookie = "username=" + username + "; expires=" + data.expires.toUTCString() + ";";
			
			window.location.replace("waitingroom");
		});
		
		socket.on('loginfail', function(message){
			$('#login_text').text(message);
			console.log(message);
		});
	});

	// when the client hits ENTER on their keyboard
	$('#password').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#login').focus().click();
		}
	});
}

function init_waitingroom(socket){
	// when user clicks 'Logout'
	$('#logout').click( function() {
		// get the username and password
		var username = getCookie("username");
		var sessionid = getCookie("sessionid");
		document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		
		socket.emit('logout', parseInt(sessionid));
		socket.on('logoutsuccess', function(){
			window.location.replace("login");
		});
	});
}

function getCookie(cname){
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}
