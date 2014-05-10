#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var mysql =  require('mysql');
var router = require('./js/router');
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

// connection.query('SET GLOBAL time_zone = ?', "+8:00");

// initialize database
connection.query('DROP TABLE IF EXISTS users');
connection.query('CREATE TABLE users (' +
					'username varchar(255) NOT NULL PRIMARY KEY,' +
					'password varchar(255) NOT NULL)');
connection.query('DROP TABLE IF EXISTS sessions');
connection.query('CREATE TABLE sessions (' +
					'id varchar(255) NOT NULL PRIMARY KEY,' +
					'expire datetime)');
connection.query('INSERT INTO users SET ?', {username: 'john', password: 'john'});
connection.query('INSERT INTO users SET ?', {username: 'danny', password: 'danny'});
connection.query('INSERT INTO users SET ?', {username: 'raymond', password: 'raymond'});
connection.query('INSERT INTO users SET ?', {username: 'walter', password: 'walter'});

app.set('port', osport || 8080); 
app.set('ipaddress', osipaddress); 

var server = http.createServer(app);
server.listen(app.get('port'), app.get('ipaddress'));
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/html', express.static(__dirname + '/html'));
app.use('/js', express.static(__dirname + '/js'));
app.use(express.cookieParser());
app.use(express.session({secret: 'blokus'}));

router(app);

// usernames which are currently connected to the chat
var usernames = {};

init_server(io, usernames, connection);
