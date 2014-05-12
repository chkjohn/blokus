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
			var bg_div = document.createElement('div');
			var gr_config = document.createElement('div');
			var table = document.createElement('table');
			
			var tr = document.createElement('tr');
			var label = $('<td>Name of Game Room: </td>')
			var input = $('<td><input type="text" size="20" id="gameRoomName"></td>');
			tr.appendChild(label);
			tr.appendChild(input);
			table.appendChlid(tr);
			
			tr = document.createElement('tr');
			var cancel = $('<td align=center><input id="register" class=button type=button value=Register style="width: 100%"></td>');
			var create = $('<td align=center><input id="login" class=button type=button value=Login style="width: 100%"></td>');
			tr.appendChild(cancel);
			tr.appendChild(create);
			table.appendChlid(tr);
			
			table.style.height = '300px';
			table.style.width = '300px';
			table.style.position = 'absolute';
			table.style.top = (window.innerHeight - 150)/2 + 'px';
			table.style.left = (window.innerWidth - 150)/2 + 'px';
			
			bg_div.style.height = "100%";
			bg_div.style.width = "100%";
			bg_div.style.position = "fixed";
			bg_div.style.top = 0;
			bg_div.style.left = 0;
			bg_div.style.background = "rgba(0,0,0,0.5)";
			bg_div.style.zIndex = 3;
			bg_div.id = "background";
			
			document.body.appendChild(bg_div);
			document.body.appendChild(table);
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
