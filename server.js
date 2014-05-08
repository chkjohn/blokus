#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var mysql =  require('mysql');
var init_server = require('./js/init_server');

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

connection.query('SET GLOBAL time_zone = ?', "+8:00")

// create tables
connection.query('DROP TABLE IF EXISTS users');
connection.query('CREATE TABLE users (' +
					'username varchar(255) NOT NULL PRIMARY KEY,' +
					'password varchar(255) NOT NULL)');
connection.query('DROP TABLE IF EXISTS sessions');
connection.query('CREATE TABLE sessions (' +
					'id bigint(10) UNSIGNED NOT NULL PRIMARY KEY,' +
					'expire datetime)');

app.set('port', osport || 8080); 
app.set('ipaddress', osipaddress); 

app.use('/js', express.static(__dirname + '/js'));
app.use('/html', express.static(__dirname + '/html'));

// routing
app.get('/', function(request, response) {
    response.sendfile(__dirname + "/index.html");
});
app.get('/index', function(request, response) {
    response.sendfile(__dirname + "/index.html");
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

init_server(io, usernames, connection);
