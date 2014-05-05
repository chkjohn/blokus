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

var server = http.createServer(app);

server.listen(app.get('port'), app.get('ipaddress'));

app.get('/', function(request, response) {
    response.sendfile("./index.html");
});

app.get('/index', function(request, response) {
    response.sendfile("./index.html");
});

app.get('/blokus', function(request, response) {
    response.sendfile("./blokus.html");
});
