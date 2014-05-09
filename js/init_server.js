module.exports = function(io, usernames, connection){
	io.sockets.on('connection', function (socket) {

		// when the client emits 'sendchat', this listens and executes
		socket.on('sendchat', function (data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			io.sockets.emit('updatechat', socket.username, data);
		});

		// when the client emits 'adduser', this listens and executes
		socket.on('adduser', function(username){
			// we store the username in the socket session for this client
			socket.username = username;
			// add the client's username to the global list
			usernames[username] = username;
			// echo to client they've connected
			socket.emit('updatechat', 'SERVER', 'you have connected');
			// echo globally (all clients) that a person has connected
			socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
			// update the list of users in chat, client-side
			io.sockets.emit('updateusers', usernames);
		});

		// when the user disconnects.. perform this
		socket.on('disconnect', function(){
			// remove the username from global usernames list
			delete usernames[socket.username];
			// update list of users in chat, client-side
			io.sockets.emit('updateusers', usernames);
			// echo globally that this client has left
			socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		});
		
		// when user clicks on 'Register'
		socket.on('register', function(data){
			connection.query('INSERT INTO users SET ?', data, function(e, rows, fields){
				var message = '';
				if (e){
					message = "Register Fail. The user " + data.username + " already exists.";
					socket.emit('registerfail', message);
				} else{
					message = "Welcome, " + data.username + ". You have registered successfully.\n\nPlease login to play the game.";
					socket.emit('registersuccess', message);
				}
			});
		});
		
		// when user clicks on 'Login'
		socket.on('login', function(data){
			connection.query('SELECT * FROM users WHERE username=? AND password=?', [data.username, data.password], function(e, rows, fields){
				var message = '';
				if (rows.length == 1){
					// login success
					var sessionid = Math.floor((Math.random() * 9999999999) + 1).toString();
					var expires = new Date();
					//expires.setHours(expires.getHours() + 1);
					expires.setMinutes(expires.getMinutes() + 5);
					expires_sql = expires.toISOString().slice(0, 19).replace('T', ' ');
					
					connection.query('INSERT INTO sessions SET ?', {id: sessionid, expire: expires_sql}, function(e, rows, fields){
						console.log(sessionid);
						socket.emit('loginsuccess', sessionid);
					});
				} else{
					// login fail
					message = "Login Fail. Please try again.";
					socket.emit('loginfail', message);
				}
			});
		});
		
		// when user clicks on 'Logout'
		socket.on('logout', function(sessionid){
			connection.query('DELETE FROM sessions WHERE id=?', sessionid, function(e, rows, fields){
				// logout success
				socket.emit('logoutsuccess', "logout");
			});
		});
	});
}
