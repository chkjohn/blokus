#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var app = express();
 
app.listen(3000);

app.get('/', function(request, response) {
    response.sendfile("index.html");
});

app.get('/index', function(request, response) {
    response.sendfile("index.html");
});

app.get('/blokus', function(request, response) {
    response.sendfile("blokus.html");
});
