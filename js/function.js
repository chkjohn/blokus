// init function for login.html
function init_login(socket){
	// when user clicks 'Register'
	$('#register').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('#password').val();
		$('#username').val('');
		$('#password').val('');
		
		// send 'register' request to server
		socket.emit('register', {username: username, password: password});
		socket.on('registersuccess', function(message){
			// register success
			// display message in the webpage
			$('#login_text').html(message);
			console.log(message);
		});
		
		socket.on('registerfail', function(message){
			// register fail
			// display message in the webpage
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
		
		// send 'login' request to server
		socket.emit('login', {username: username, password: password});
		socket.on('loginsuccess', function(sessionid){
			// login success
			var expires = new Date();
			//expires.setHours(expires.getHours() + 1);
			expires.setMinutes(expires.getMinutes() + 5);
			
			// store the session key and username as cookies
			document.cookie = "sessionid=" + sessionid + "; expires=" + expires.toUTCString() + ";";
			//document.cookie = "username=" + username + "; expires=" + expires.toUTCString() + ";";
			console.log(document.cookie);
			
			// go to the webpage of waiting room
			window.location.replace("waitingroom");
		});
		
		socket.on('loginfail', function(message){
			// login fail
			// display message in the webpage
			$('#login_text').html(message);
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

// init function for waitingroom.html
function init_waitingroom(socket){
	// when user clicks 'Logout'
	$('#logout').click( function() {
		// get the username and sessionid for cookies
		//var username = getCookie("username");
		var sessionid = getCookie("sessionid");
		
		// delete all cookies
		//document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		
		// send 'logout' request to server
		socket.emit('logout', sessionid);
		socket.on('logoutsuccess', function(){
			// logout success
			// go back to login page
			window.location.replace("login");
		});
	});
}

// get the value (string) of cookie
function getCookie(cname){
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0)
			return c.substring(name.length,c.length);
	}
	return "";
}
