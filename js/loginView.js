// init function for login.html
function init_login(socket){
	$('#username').focus();
	
	// when user clicks 'Register'
	$('#register').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('#password').val();
		$('#username').val('');
		$('#password').val('');
		
		if (username == "" || password == ""){
			$('#login_text').html("Please input both username and password.");
			$('#username').focus();
		} else{
			// send 'register' request to server
			socket.emit('register', {username: username, password: password});
			socket.on('registersuccess', function(message){
				// register success
				// display message in the webpage
				$('#login_text').html(message);
				console.log(message);
				$('#username').focus();
			});
			
			socket.on('registerfail', function(message){
				// register fail
				// display message in the webpage
				$('#login_text').text(message);
				console.log(message);
				$('#username').focus();
			});
		}
	});
	
	// when user clicks 'Login'
	$('#login').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('#password').val();
		$('#username').val('');
		$('#password').val('');
		
		if (username == "" || password == ""){
			$('#login_text').html("Please input both username and password.");
			$('#username').focus();
		} else{
			// send 'login' request to server
			socket.emit('login', {username: username, password: password});
			socket.on('loginsuccess', function(sessionid){
				// login success
				var expires = new Date();
				expires.setHours(expires.getHours() + 1);
				//expires.setMinutes(expires.getMinutes() + 5);
				
				// store the session key and username as cookies
				$.cookie('sessionid', sessionid);
				$.cookie('network', "true");
				//document.cookie = "sessionid=" + sessionid + "; expires=" + expires.toUTCString() + ";";
				console.log(document.cookie);
				
				// go to the webpage of waiting room
				window.location.replace("waitingroom");
			});
			
			socket.on('loginfail', function(message){
				// login fail
				// display message in the webpage
				$('#login_text').html(message);
				console.log(message);
				$('#username').focus();
			});
		}
	});
	
	$('#guest').click(function(){
		$.cookie('network', "false");
		$.cookie('playerIndex', "0");
		window.location.replace('blokus');
	});

	// when the client hits ENTER on their keyboard
	$('#password').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#login').focus().click();
		}
	});
}
