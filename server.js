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
var io = require('socket.io').listen(server.listen(app.get('port'), app.get('ipaddress')));
/*
io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
*/
