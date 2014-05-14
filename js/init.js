module.exports = {
	init_db: function(connection){
		// initialize database
		connection.query('DROP TABLE IF EXISTS users');
		connection.query('CREATE TABLE users (' +
							'username varchar(255) NOT NULL PRIMARY KEY,' +
							'password varchar(255) NOT NULL,' +
							'wintime int(5) UNSIGNED DEFAULT 0' + ')');
		connection.query('DROP TABLE IF EXISTS sessions');
		connection.query('CREATE TABLE sessions (' +
							'id varchar(255) NOT NULL PRIMARY KEY,' +
							'expire datetime)');
		connection.query('INSERT INTO users SET ?', {username: 'john', password: 'john'});
		connection.query('INSERT INTO users SET ?', {username: 'danny', password: 'danny'});
		connection.query('INSERT INTO users SET ?', {username: 'raymond', password: 'raymond'});
		connection.query('INSERT INTO users SET ?', {username: 'walter', password: 'walter'});
	},
	
	init_server: function(io, usernames, connection, gamerooms, client_index){
		var login = io.of('/login');
		var waitingRoom = io.of('/waitingRoom');
		var game = io.of('/game');
		
		/* Code for Login System Start*/
		login.on('connection', function (socket){
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
						//var sessionid = Math.floor((Math.random() * 9999999998) + 1).toString();
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
								socket.username = data.username;
								socket.ready = false;
								usernames[data.username] = data.username;
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
		});
		/* Code for Login System End*/

		waitingRoom.on('connection', function (socket){
			// when the client emits 'adduser', this listens and executes
			socket.on('adduser', function(username){
				// we store the username in the socket session for this client
				socket.username = username;
				socket.ready = false;
				// add the client's username to the global list
				usernames[username] = username;
				// echo to client they've connected
				var tmp = Object.keys(gamerooms);
				for (var i in tmp){
					socket.emit('updateGameRoomList', tmp[i], gamerooms[tmp[i]].players, false);
				}
				// update the list of users in chat, client-side
				socket.emit('updateusers', usernames);
				socket.broadcast.emit('updateusers', usernames);
			});

			// when user clicks on 'Logout'
			socket.on('logout', function(sessionid){
				// delete the corresponding session from database
				connection.query('DELETE FROM sessions WHERE id=?', sessionid, function(e, rows, fields){
					// logout success
					delete usernames[socket.username];
					socket.emit('logoutsuccess', "logout");
				});
			});

			socket.on('createGameRoom', function(gameroom){
				socket.gameroom = gameroom;
				gamerooms[gameroom] = {sockets: [socket], players: [socket.username], ready: [socket.ready]};
				socket.emit('createGameRoomSuccess');
				socket.emit('updateGameRoomList', gameroom, gamerooms[gameroom].players, true);
				socket.broadcast.emit('updateGameRoomList', gameroom, gamerooms[gameroom].players, false);
			});

			socket.on('joinGameRoom', function(gameroom){
				if (gamerooms[gameroom].players.length < 4){
					gamerooms[gameroom].players.push(socket.username);
					gamerooms[gameroom].sockets.push(socket);
					socket.emit('joinGameRoomSuccess', gamerooms[gameroom].players, gamerooms[gameroom].ready);
					socket.broadcast.emit('updateGameRoomTab',gameroom, gamerooms[gameroom].players);
				} else{
					socket.emit('joinGameRoomFail');
				}
			});

			socket.on('gameReady', function(gameroom){
				gamerooms[gameroom].ready.push(true);
				socket.ready = true;
				socket.broadcast.emit('updateReadyStatus', gamerooms[gameroom].players, gamerooms[gameroom].ready);
				if (gamerooms[gameroom].ready.length == 4){
					for (var i in gamerooms[gameroom].sockets){
						gamerooms[gameroom].sockets[i].emit('gameReady');
					}
				}
			});

			socket.on('gameNotReady', function(gameroom){
				socket.ready = false;
				if (gamerooms[gameroom].ready.length > 0){
					if (gamerooms[gameroom].players[i] == socket.username)
						gamerooms[gameroom].ready.splice(i, 1);
				}
				socket.broadcast.emit('updateReadyStatus', gamerooms[gameroom].players, gamerooms[gameroom].ready);
			});

			socket.on('leaveGameRoom', function(gameroom){
				for (var i in gamerooms[gameroom].players){
					if (gamerooms[gameroom].players[i] == socket.username){
						gamerooms[gameroom].players.splice(i, 1);
						gamerooms[gameroom].sockets.splice(i, 1);
					}
				}
			});
		});

		game.on('connection', function (client) {
			util.log("New player has connected: " + client.id);
			// Listen for client disconnected
			client.on("disconnect", onClientDisconnect);

			// Listen for new player message
			client.on("nextTile", onNewPlayer);

			client.on("client_index", onChangeClientIndex);

			// Socket client has disconnected
			function onClientDisconnect() {
				util.log("Player has disconnected: "+this.id);
				// Broadcast removed player to connected socket clients
				this.broadcast.emit("remove player", {id: this.id});
			};

			// New player has joined
			function onNewPlayer(msg) {
				// Broadcast new player to connected socket clients
				util.log("Yeah!");
				util.log("msg is: " + msg);
				util.log(msg.status + " "  + msg.data);
				if(msg.status == "next"){
					util.log(msg.data.tile);
					util.log(JSON.stringify(msg.data));
				}
				//{ status:"next",data:{tile:tile, tile_index:tile_index, mouse_co:mouse_co} }
				this.broadcast.emit("message", msg);
				//this.broadcast.emit("message", {status:msg.status});
			};

			function onChangeClientIndex(msg){
				this.emit("client_index", client_index);
				util.log("The client_index is: " + client_index);
				client_index++;
				client_index = client_index % 4;
			}
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
