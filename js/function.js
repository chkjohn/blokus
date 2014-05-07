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

connection.connect(function(e){
	if (e){
		throw e;
	} else{
		console.log('Connected to database');
	}
});

connection.query('CREATE TABLE users (' +
					'username varchar(255) NOT NULL PRIMARY KEY,' +
					'password varchar(255) NOT NULL)');

$(function(){
	// when the client clicks SEND
	$('#register').click( function() {
		var message = $('#data').val();
		$('#data').val('');
		// tell server to execute 'sendchat' and send along one parameter
		socket.emit('sendchat', message);
	});

	// when the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#datasend').focus().click();
		}
	});
});
