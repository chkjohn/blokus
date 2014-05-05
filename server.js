#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var app = express();

console.log(process.env.OPENSHIFT_NODEJS_PORT);
app.listen(process.env.OPENSHIFT_NODEJS_PORT);

app.get('/', function(request, response) {
    response.sendfile("index.html");
});

app.get('/index', function(request, response) {
    response.sendfile("index.html");
});

app.get('/blokus', function(request, response) {
    response.sendfile("blokus.html");
});
