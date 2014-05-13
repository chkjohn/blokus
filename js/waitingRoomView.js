// init function for waitingroom.html
function init_waitingroom(socket){
	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		var sessionid = getCookie('sessionid');
		if (sessionid != ""){
			// call the server-side function 'adduser' and send one parameter (value of prompt)
			socket.emit('adduser', sessionid);
		}
	});

	// listener, whenever the server emits 'updateGameRoomList', this updates the gameroom list
	socket.on('updateGameRoomList', function (gameroom, players, creater) {
		var gameroomTab = $('<div />');
		var table = $('<table />');
		var name = $('<tr><td colspan=2><h1>' + gameroom +'</h1></td></tr>');
		var tabContent = $('<tr><td>' + 'No. of players: ' + '</td><td id=' + gameroom + '_numPlayers>' + players.length + '</td></tr>');

		table.append(name, tabContent);
		gameroomTab.append(table);
		table.width('50%');
		table.css('padding-left', '10%');
		gameroomTab.hide().prependTo('#gameroom').slideDown();
		gameroomTab.attr({'id': gameroom + '_tab', 'class': 'gameroomTab'});
		if (!creater){
			var joinButton = $('<input type=button class=waitingRoomButton value=Join>');
			gameroomTab.append(joinButton);
			joinButton.css('display', 'flex');
			joinButton.click(function(){
				socket.emit('joinGameRoom', gameroom);
				socket.on('joinGameRoomSuccess', function(players, ready){
					$('#gameRoomReady h1').html(gameroom + '<br>');

					for (var i in players){
						var playerTab = $('<h3 />');
						$('#playerInTheRoom').empty();
						$('#playerInTheRoom').append(playerTab);
						playerTab.html(players[i] + '<br>');
						if (ready[i])
							playerTab.css('color', 'green');
						else
							playerTab.css('color', 'red');
					}
					$('#ready').change(function(){
						if (this.checked)
							socket.emit('gameReady', gameroom);
						else
							socket.emit('gameNotReady', gameroom);
					});
					socket.on('updateReadyStatus', function(players, ready){
						for (var i in players){
							var playerTab = $('<h3 />');
							$('#playerInTheRoom').empty();
							$('#playerInTheRoom').append(playerTab);
							playerTab.html(players[i] + '<br>');
							if (ready[i])
								playerTab.css('color', 'green');
							else
								playerTab.css('color', 'red');
						}
					});
					$('#background').fadeIn();
					$('#gameRoomReady').hide().appendTo('body').fadeIn();
					$('#gameRoomReady').css({'top': (window.innerHeight - 400)/2 + 'px', 'left': (window.innerWidth - 300)/2 + 'px'});
				});
			});
		}
	});

	socket.on('updateGameRoomTab', function (gameroom, players) {
		var gameroomTab = $('#' + gameroom + '_tab');
		var numPlayers = $('#' + gameroom + '_numPlayers');

		numPlayers.text(players.length);
	});

	// listener, whenever the server emits 'updateusers', this updates the username list
	socket.on('updateusers', function (data) {
		//console.log(data);
		$('#users').empty();
		$.each(data, function(key, value) {
			var div = $('<div>' + key + '</div>');
			$('#users').append(div)
			div.attr('id', key);
		});
	});

	socket.on('gameReady', function(){
		window.location.replace("blokus");
	});

	// on load of page
	$(function(){
		// when user clicks 'Logout'
		$('#logout').click( function() {
			// get the username and sessionid for cookies
			var sessionid = getCookie("sessionid");
			
			// delete all cookies
			document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
			
			// send 'logout' request to server
			socket.emit('logout', sessionid);
			socket.on('logoutsuccess', function(){
				// logout success
				// go back to login page
				window.location.replace("login");
			});
		});
		
		// when the client clicks SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});
		
		$('#createGameRoom').click(function(){
			var height = $('#createGameRoomTable').height();
			var width = $('#createGameRoomTable').width();
			$('#createGameRoomTable').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
			$('#createGameRoomTable').fadeIn();
			$('#background').fadeIn();
			$('#gameRoomName').focus();
		});
		
		$('#background').click(function(){
			$('#createGameRoomTable').fadeOut();
			$('#confirmMessage').fadeOut();
			$('#background').fadeOut();
		});
		
		$('#cancelCreateGameRoom').click(function(){
			$('#createGameRoomTable').fadeOut();
			$('#background').fadeOut();
		});
		
		$('#confirmCreateGameRoom').click(function(){
			var name = $('#gameRoomName').val();
			$('#gameRoomName').val('');

			$('#createGameRoomTable').hide();
			var height = $('#confirmMessage').height();
			var width = $('#confirmMessage').width();
			$('#confirmMessage').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
			$('#confirmMessage').fadeIn();
			var message = '';

			socket.emit('createGameRoom', name);
			socket.on('createGameRoomSuccess', function(){
				message = 'Game Room \"' + name + '\" has been created.';
				$('#confirmMessage h3').text(message);
				setTimeout(function(){
					$('#confirmMessage').fadeOut();
					$('#background').fadeOut();
				}, 2000);
			});
			socket.on('createGameRoomFail', function(){
				message = 'Unable to create the game room \"' + name + '\". Please try again.';
				$('#confirmMessage h3').text(message);
			});
		});
		
		$('#closeConfirmMessage').click(function(){
			$('#confirmMessage').fadeOut();
			$('#background').fadeOut();
		});
		
		// when the client hits ENTER on their keyboard
		$('#data').keypress(function (e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});

		$('#gameRoomName').keypress(function (e) {
			if(e.which == 13) {
				$(this).blur();
				$('#confirmCreateGameRoom').focus().click();
			}
		});
	});
}
