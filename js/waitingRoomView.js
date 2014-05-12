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

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		var chat = $('<b>'+username + ':</b> ' + data + '<br>');
		$('#gameroomlist').append(chat);
		chat.css('padding-left', '20px');
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
			$('#createGameRoomTable').css({'display': 'initial', 'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
			
			$('#background').css('display', 'initial');
		});
		
		$('#cancelCreateGameRoom').click(function(){
			$('#createGameRoomTable').css('display', 'none');
			$('#background').css('display', 'none');
		});
		
		$('#confirmCreateGameRoom').click(function(){
			$('#createGameRoomTable').css('display', 'none');
			var height = $('#confirmMessage').height();
			var width = $('#confirmMessage').width();
			$('#confirmMessage').css({'display': 'initial', 'top': (window.innerHeight - height)/2 + 'px', 'left': (window.innerWidth - width)/2 + 'px'});
			var name = $('#gameRoomName').val();
			$('#gameRoomName').val('');
			var message = 'Game Room ' + name + ' has been created.';
			$('#confirmMessage h3').text(message);
		});
		
		$('#close').click(function(){
			$('#confirmMessage').css('display', 'none');
			$('#background').css('display', 'none');
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
