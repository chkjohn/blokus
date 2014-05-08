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
			connection.query('INSERT INTO users VALUES username=?, password=?', {username: data[0], password: data[1]}, function(e, rows, fields){
				var message = '';
				if (e){
					message = "Register Fail. The user " + data[0] + " already exists.";
					socket.emit('registerfail', message);
				} else{
					message = "Welcome, " + data[0] + ". You have registered successfully.\nPlease login to play the game.";
					socket.emit('registersuccess', message);
				}
			});
		});
		
		// when user clicks on 'Login'
		socket.on('login', function(data){
			connection.query('SELECT * FROM users WHERE username=?', data[0], function(e, rows, fields){
				var message = '';
				if (e || rows['password'] != data[1]){
					message = "Login Fail.";
					socket.emit('loginfail', message);
				} else{
					message = "Welcome back, " + data[0] + ".";
					socket.emit('loginsuccess', message);
				}
			});
		});
		
		socket.on('storesessioncookie', function(sessionid){
			var expires = new Date();
			expires.setHours(expires.getHours() + 1);
			expires = expires.toISOString().slice(0, 19).replace('T', ' ');
			
			connection.query('INSERT INTO sessions VALUES id=?, expire=?', [sessionid, expires], function(e, rows, fields){
				var message = '';
				if (e)	throw e;
				console.log(sessionid);
			});
		});
	});
}
