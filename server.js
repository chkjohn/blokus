#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var app = express();

console.log(8080);
app.listen(8080);

app.get('/', function(request, response) {
    response.sendfile("./index.html");
});

app.get('/index', function(request, response) {
    response.sendfile("./index.html");
});

app.get('/blokus', function(request, response) {
    response.sendfile("./blokus.html");
});
