#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var http = require('http');
var mysql =  require('mysql');
var func = require('js/function.js');

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
connection.query('CREATE TABLE IF EXISTS users (' +
					'username varchar(255) NOT NULL PRIMARY KEY,' +
					'password varchar(255) NOT NULL)');
connection.query('CREATE TABLE IF EXISTS sessions (' +
					'id int(20) NOT NULL PRIMARY KEY,' +
					'expire datetime)');

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
app.get('/waitingroom', function(request, response) {
    response.sendfile(__dirname + "/html/waitingroom.html");
});

var server = http.createServer(app);
server.listen(app.get('port'), app.get('ipaddress'));
var io = require('socket.io').listen(server);

// usernames which are currently connected to the chat
var usernames = {};

func.init_server(io, usernames, connection);
