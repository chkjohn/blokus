#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var app = express();
var util = require("util");				// Utility resources (logging, object inspection, etc)
var fs = require('fs');
var http = require('http');
var mysql =  require('mysql');
var init = require('./js/init');

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

init.init_db(connection);

// connection.query('SET GLOBAL time_zone = ?', "+8:00");

app.set('port', osport || 8080); 
app.set('ipaddress', osipaddress); 

var server = http.createServer(app);
server.listen(app.get('port'), app.get('ipaddress'));
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/html', express.static(__dirname + '/html'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use(express.cookieParser());
app.use(express.session({secret: 'blokus'}));

// routing
app.get('/', function(request, response) {
	response.sendfile(__dirname + "/html/index.html");
});
app.get('/index', function(request, response) {
	response.sendfile(__dirname + "/html/index.html");
});
app.get('/blokus', function(request, response) {
	response.sendfile(__dirname + "/html/blokus.html");
});
app.get('/login', function(request, response) {
	//response.cookie('test', 'Hello', { maxAge: 900000 });
	response.sendfile(__dirname + "/html/login.html");
});
app.get('/waitingroom', function(request, response) {
	response.sendfile(__dirname + "/html/waitingroom.html");
});

// usernames which are currently connected to the chat
var usernames = {};
var gamerooms = {};
var client_index = 0;

init.init_server(io, util, usernames, connection, gamerooms, client_index);
