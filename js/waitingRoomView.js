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
	socket.on('updateGameRoomList', function (gameroom, data) {
		var gameroomTab = $('<div></div>');
		var table = $('<table></table>');
		var name = $('<th><h1>' + gameroom + '</h1></th>');

		var tabContent = ' ';
		for (var roomconfig in data){
			tabContent = $('<tr><td>' + 'No. of players: ' + '</td><td>' + roomconfig.numPlayers + '</td></tr>');
		}
		table.append(name, tabContent);
		gameroomTab.append(table);
		gameroomTab.hide().prependTo('#gameroom').slideDown();
		gameroomTab.attr({'id': gameroom + '_tab', 'class': 'gameroomTab'});
	});

	// listener, whenever the server emits 'updateusers', this updates the username list
	socket.on('updateusers', function(data) {
		//console.log(data);
		$('#users').empty();
		$.each(data, function(key, value) {
			var div = $('<div>' + key + '</div>');
			$('#users').append(div)
			div.attr('id', key);
		});
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
				}, 3000);
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
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
	});
}
