function init_login_client(socket){
	// when the client clicks Register
	$('#register').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('password').val();
		$('#username').val('');
		$('#password').val('');
		
		socket.emit('register', [username, password]);
		socket.on('registersuccess', function(message){
			$('#login_text').textContent = message;
		});
		
		socket.on('registerfail', function(message){
			$('#login_text').textContent = "Register Fail. Please try again.";
		});
	});
	
	$('#login').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('password').val();
		$('#username').val('');
		$('#password').val('');
		
		socket.emit('login', [username, password]);
		socket.on('loginsuccess', function(message){
			var sessionid = Math.floor((Math.random() * 9999999999) + 1).toString();
			var expires = new Date();
			expires.setHours(expires.getHours() + 1);
			
			document.cookie = "sessionid=" + sessionid + "; expires=" + expires.toString() + ";";
			document.cookie = "username=" + username + "; expires=" + expires.toString() + ";";
			
			socket.emit('storesessioncookie', sessionid);
			
			window.location.replace("csci4140project-chkjohn.rhcloud.com/waitingroom");
			
		});
		
		socket.on('loginfail', function(message){
			$('#login_text').textContent = "Login Fail. Please try again.";
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

function getCookie(cname){
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}
