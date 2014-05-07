#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var http = require('http');
var mysql =  require('mysql');

var app = express();
var osipaddress = process.env.OPENSHIFT_NODEJS_IP; 
var osport = process.env.OPENSHIFT_NODEJS_PORT;

var connection =  mysql.createConnection({
	host	: process.env.OPENSHIFT_MYSQL_DB_HOST,
	user	: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
	password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
	port	: process.env.OPENSHIFT_MYSQL_DB_PORT,
	database: process.env.OPENSHIFT_APP_NAME
});

// connect to database
connection.connect(function(e){
	if (e)	throw e;
	console.log('Connected to database');
});

// create tables
connection.query('CREATE TABLE users (' +
					'username varchar(255) NOT NULL PRIMARY KEY,' +
					'password varchar(255) NOT NULL)');
connection.query('CREATE TABLE sessions (' +
					'id int(20) NOT NULL PRIMARY KEY,' +
					'expire datetime2)');

app.set('port', osport || 8080); 
app.set('ipaddress', osipaddress); 

//app.use(express.static(__dirname + '/public'));

// routing
app.get('/', function(request, response) {
    response.sendfile(__dirname + "/index.html");
});
app.get('/index', function(request, response) {
    response.sendfile(__dirname + "/html/index.html");
});
app.get('/blokus', function(request, response) {
    response.sendfile(__dirname + "/html/blokus.html");
});
app.get('/login', function(request, response) {
    response.sendfile(__dirname + "/html/login.html");
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

$(function(){
	// when the client clicks Register
	$('#register').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('password').val();
		$('#username').val('');
		$('#password').val('');
		
		connection.query('INSERT INTO users VALUES username=?, password=?', [username, password], function(e, rows, fields){
			if (e)	throw e;
			console.log('Stored ' + username + 'in database');
		});
	});
	
	$('#login').click( function() {
		// get the username and password
		var username = $('#username').val();
		var password = $('password').val();
		$('#username').val('');
		$('#password').val('');
		
		connection.query('SELECT * FROM users WHERE username=?', [username], function(e, rows, fields){
			if (e)	throw e;
			console.log(rows);
		});
	});

	// when the client hits ENTER on their keyboard
	$('#password').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#login').focus().click();
		}
	});
});

