#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var http = require('http');

var app = express();
var osipaddress = process.env.OPENSHIFT_NODEJS_IP; 
var osport = process.env.OPENSHIFT_NODEJS_PORT; 

app.set('port', osport || 8080); 
app.set('ipaddress', osipaddress); 

//app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.sendfile(__dirname + "/index.html");
});

app.get('/index', function(request, response) {
    response.sendfile(__dirname + "/index.html");
});

app.get('/blokus', function(request, response) {
    response.sendfile(__dirname + "/blokus.html");
});

var server = http.createServer(app);
server.listen(app.get('port'), app.get('ipaddress'));
var io = require('socket.io').listen(server);


// usernames which are currently connected to the chat
var usernames = {};

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
});
