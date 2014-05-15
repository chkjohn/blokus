// init function for waitingroom.html
function init_waitingroom(socket){
	function waitForOtherPlayers(gameroom, players){
		$.cookie("gameroom", gameroom);
		$.cookie("playerIndex", checkPlayerIndex(players));

		$('#gameRoomReady h1').html(gameroom + '<br>');

		console.log(gameroom);
		console.log(players);
		$('#playerInTheRoom').empty();
		for (var i in players){
			var playerTab = $('<h3 />');
			$('#playerInTheRoom').append(playerTab);
			playerTab.html(players[i] + '<br>');
		}
		var height = $('#gameRoomReady').height();
		var width = $('#gameRoomReady').width();
		$('#gameRoomReady').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
		$('#background').fadeIn();
		$('#gameRoomReady').fadeIn();
		$('#background').click(function(){
			leaveGameRoom(gameroom);
		});
		$('#close').click(function(){
			leaveGameRoom(gameroom);
		});

		socket.on('updateReadyStatus', function(players){
			$('#playerInTheRoom').empty();
			for (var i in players){
				var playerTab = $('<h3 />');
				$('#playerInTheRoom').append(playerTab);
				playerTab.html(players[i] + '<br>');
			}
			$.cookie("playerIndex", checkPlayerIndex(players));
		});
	}

	function checkPlayerIndex(players){
		var sessionid = $.cookie('sessionid');
		for (var i in players){
			if (players[i] == sessionid)
				return i.toString();
		}
		return null;
	}

	function leaveGameRoom(gameroom){
		$.removeCookie("gameroom");
		$.removeCookie("playerIndex");
		$('#gameRoomReady').fadeOut();
		$('#background').fadeOut();
		socket.emit('leaveGameRoom', gameroom);
	}

	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		var sessionid = $.cookie('sessionid');
		if (sessionid != undefined){
			// call the server-side function 'adduser' and send one parameter (value of prompt)
			socket.emit('adduser', sessionid);
			socket.username = sessionid;
		}
	});

	// listener, whenever the server emits 'updateGameRoomList', this updates the gameroom list
	socket.on('updateGameRoomList', function (gameroom, players, creater) {
		var gameroomTab = $('<div />');
		var table = $('<table />');
		var name = $('<tr><td colspan=2><h1>' + gameroom +'</h1></td></tr>');
		var tabContent = $('<tr><td>' + 'No. of players: ' + '</td><td id=' + gameroom + '_numPlayers style="width: 50%; font-size: xx-large">' + players.length + '</td></tr>');

		table.append(name, tabContent);
		gameroomTab.append(table);
		table.width('60%');
		gameroomTab.hide().prependTo('#gameroom').slideDown();
		gameroomTab.attr({'id': gameroom + '_tab', 'class': 'gameroomTab'});
		if (!creater){
			var joinButton = $('<input type=button class=waitingRoomButton value=Join>');
			gameroomTab.append(joinButton);
			joinButton.attr({'id': 'joinButton'});
			joinButton.css({'position': 'relative', 'width': '40%', 'font-size': 'xx-large'});
			$('#joinButton').click(function(){
				console.log('join');
				socket.emit('joinGameRoom', gameroom);
				socket.on('joinGameRoomSuccess', function (players){
					if (players.length < 4)
						$('#' + gameroom + '_tab').css('color', 'lime');
					else
						$('#' + gameroom + '_tab').css('color', 'red');
					waitForOtherPlayers(gameroom, players);
				});
				socket.on('joinGameRoomFail', function (){
					var height = $('#confirmMessage').height();
					var width = $('#confirmMessage').width();
					$('#confirmMessage').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
					$('#confirmMessage').fadeIn();
					$('#background').fadeIn();
					var message = 'Game room \"' + gameroom + '\" is already full.';
					$('#confirmMessage h3').text(message);
					$('#background').click(function(){
						$('#confirmMessage').fadeOut();
						$('#background').fadeOut();
					});
				});
			});
		}
	});

	socket.on('updateGameRoomTab', function (gameroom, players) {
		var gameroomTab = $('#' + gameroom + '_tab');
		var numPlayers = $('#' + gameroom + '_numPlayers');

		if (players.length == 0)
			gameroomTab.remove();
		else
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
			div.css({'color': value.status, 'font-size': 'x-large', 'font-weight': '500%'});
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
			var sessionid = $.cookie("sessionid");
			// delete all cookies
			//document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
			$.removeCookie('sessionid');

			// send 'logout' request to server
			socket.emit('logout', sessionid);
			socket.on('logoutsuccess', function(){
				// logout success
				// go back to login page
				window.location.replace("login");
			});
		});
		
		// when the client clicks 'Search Room'
		$('#searchRoom').click( function() {
			var gameroom = $('#searchRoomName').val();
			$('#searchRoomName').val('');
			socket.emit('searchGameRoom', gameroom);
			socket.on('foundGameRoom', function(players){
				$('#gameroom').empty();
				var gameroomTab = $('<div />');
				var table = $('<table />');
				var name = $('<tr><td colspan=2><h1>' + gameroom +'</h1></td></tr>');
				var tabContent = $('<tr><td>' + 'No. of players: ' + '</td><td id=' + gameroom + '_numPlayers>' + players.length + '</td></tr>');

				table.append(name, tabContent);
				gameroomTab.append(table);
				table.width('30%');
				table.css('padding-left', '10%');
				gameroomTab.hide().prependTo('#gameroom').slideDown();
				gameroomTab.attr({'id': gameroom + '_tab', 'class': 'gameroomTab'});
				var joinButton = $('<input type=button class=waitingRoomButton value=Join>');
				gameroomTab.append(joinButton);
				joinButton.attr({'id': 'joinButton', 'align': 'right'});
				joinButton.css({'position': 'relative', 'padding-left': '50px'});
				$('#joinButton').click(function(){
					console.log('join');
					socket.emit('joinGameRoom', gameroom);
					socket.on('joinGameRoomSuccess', function (players){
						if (players.length < 4)
							$('#' + gameroom + '_tab').css('color', 'lime');
						else
							$('#' + gameroom + '_tab').css('color', 'red');
						waitForOtherPlayers(gameroom, players);
					});
					socket.on('joinGameRoomFail', function (){
						var height = $('#confirmMessage').height();
						var width = $('#confirmMessage').width();
						$('#confirmMessage').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
						$('#confirmMessage').fadeIn();
						$('#background').fadeIn();
						var message = 'Game room \"' + gameroom + '\" is already full.';
						$('#confirmMessage h3').text(message);
							$('#background').click(function(){
							$('#confirmMessage').fadeOut();
							$('#background').fadeOut();
						});
					});
				});
			});
			socket.on('noGameRoom', function(){
				var height = $('#confirmMessage').height();
				var width = $('#confirmMessage').width();
				$('#confirmMessage').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
				$('#confirmMessage').fadeIn();
				$('#background').fadeIn();
				var message = 'Game room \"' + gameroom + '\" not found.';
				$('#confirmMessage h3').text(message);
				$('#background').click(function(){
					$('#confirmMessage').fadeOut();
					$('#background').fadeOut();
				});
			});
		});
		
		$('#createGameRoom').click(function(){
			var height = $('#createGameRoomTable').height();
			var width = $('#createGameRoomTable').width();
			$('#createGameRoomTable').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
			$('#createGameRoomTable').fadeIn();
			$('#background').fadeIn();
			$('#gameRoomName').focus();

			$('#background').click(function(){
				$('#createGameRoomTable').fadeOut();
				$('#background').fadeOut();
			});
		});
		
		$('#cancelCreateGameRoom').click(function(){
			$('#createGameRoomTable').fadeOut();
			$('#background').fadeOut();
		});
		
		// when user clicks 'Create' button
		$('#confirmCreateGameRoom').click(function(){
			var name = $('#gameRoomName').val();
			$('#gameRoomName').val('');

			$('#createGameRoomTable').hide();

			// send 'createGameRoom' request to server
			socket.emit('createGameRoom', name);
			socket.on('createGameRoomSuccess', function (players){
				$('#' + gameroom + '_tab').css('color', 'red');
				waitForOtherPlayers(name, players);
			});
			socket.on('createGameRoomFail', function(){
				var height = $('#confirmMessage').height();
				var width = $('#confirmMessage').width();
				$('#confirmMessage').css({'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
				$('#confirmMessage').fadeIn();
				$('#background').fadeIn();
				var message = 'Unable to create the game room \"' + name + '\". Please try again.';
				$('#confirmMessage h3').text(message);
				$('#background').click(function(){
					$('#confirmMessage').fadeOut();
					$('#background').fadeOut();
				});
			});
		});
		
		$('#close').click(function(){
			$('#createGameRoomTable').fadeOut();
			$('#confirmMessage').fadeOut();
			$('#gameRoomReady').fadeOut();
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
