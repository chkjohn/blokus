module.exports = {
	init_db: function(connection){
		// initialize database
		connection.query('DROP TABLE IF EXISTS users');
		connection.query('CREATE TABLE users (' +
							'username varchar(255) NOT NULL PRIMARY KEY,' +
							'password varchar(255) NOT NULL)');
		connection.query('DROP TABLE IF EXISTS sessions');
		connection.query('CREATE TABLE sessions (' +
							'id varchar(255) NOT NULL PRIMARY KEY,' +
							'expire datetime)');
		connection.query('INSERT INTO users SET ?', {username: 'john', password: 'john'});
		connection.query('INSERT INTO users SET ?', {username: 'danny', password: 'danny'});
		connection.query('INSERT INTO users SET ?', {username: 'raymond', password: 'raymond'});
		connection.query('INSERT INTO users SET ?', {username: 'walter', password: 'walter'});
	}
	
	init_server: function(io, usernames, connection){
		io.sockets.on('connection', function (socket) {
			/* Code for Chat Room Start*/
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
			/* Code for Chat Room End*/
			
			
			/* Code for Login System Start*/
			// when user clicks on 'Register'
			socket.on('register', function(data){
				// insert user's info into data
				connection.query('INSERT INTO users SET ?', data, function(e, rows, fields){
					var message = '';
					if (e){ // the username already exists in database
						message = "Register Fail. The user " + data.username + " already exists.";
						// send response to client
						socket.emit('registerfail', message);
					} else{ // user's info has been inserted
						message = "Welcome, " + data.username + ". You have registered successfully. <br>Please login to play the game.";
						// send response to client
						socket.emit('registersuccess', message);
					}
				});
			});
			
			// when user clicks on 'Login'
			socket.on('login', function(data){
				// check if the user's inputs match the record in the database
				connection.query('SELECT * FROM users WHERE username=? AND password=?', [data.username, data.password], function(e, rows, fields){
					var message = '';
					if (rows.length == 1){
						// valid username & password
						// create session key
						var sessionid = data.username;
						// set expire time to 5 mins
						var expires = new Date();
						expires.setHours(expires.getHours() + 1);
						//expires.setMinutes(expires.getMinutes() + 5);
						expires_sql = expires.toISOString().slice(0, 19).replace('T', ' ');
						// store session into database
						connection.query('INSERT INTO sessions SET ?', {id: sessionid, expire: expires_sql}, function(e, rows, fields){
							if (e){
								message = "You have already logged in another session from other brower/computer.<br>This game does not allow multiple login.";
								// send response to client
								socket.emit('loginfail', message);
							} else{
								console.log(sessionid);
								// send session key to client
								socket.emit('loginsuccess', sessionid);
							}
						});
					} else{
						// invalid username or password
						message = "Login Fail. Please try again.";
						socket.emit('loginfail', message);
					}
				});
			});
			
			// when user clicks on 'Logout'
			socket.on('logout', function(sessionid){
				// delete the corresponding session from database
				connection.query('DELETE FROM sessions WHERE id=?', sessionid, function(e, rows, fields){
					// logout success
					socket.emit('logoutsuccess', "logout");
				});
			});
			
			socket.on('sessioncheck', function(sessionid){
				connection.query('SELECT * FROM sessions WHERE id=?', sessionid, function(e, rows, fields){
					var message = '';
					if (rows.length == 1){
						// valid session key
						socket.emit('sessionpass', message);
					} else{
						// invalid session key
						socket.emit('sessionfail', message);
					}
				});
			});
			/* Code for Login System End*/
		});
		
		
		// for every 5 mins, check if the sessions in database have been expired
		// delete all the expired sessions
		setInterval(function(){
			connection.query('SELECT * FROM sessions', function(e, rows, fields){
				var message = '';
				if (rows.length > 0){
					for (var i in rows){
						var sessionid = rows[i].sessionid;
						var t = rows[i].expire.split(/[- :]/);
						var expires = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
						var currenttime = new Date();
						
						// for each record, check if the current time is beyond the expire time
						if (currenttime.getTime() >= expires){
							// if so, delete the record
							connection.query('DELETE FROM sessions WHERE id=?', sessionid);
						}
					}
				}
			});
		}, 300000);
	}
}
