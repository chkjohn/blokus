module.exports = function(app){
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
		response.cookie('test', 'Hello', { maxAge: 900000 });
		response.sendfile(__dirname + "/html/login.html");
	});
	app.get('/waitingroom', function(request, response) {
		response.sendfile(__dirname + "/html/waitingroom.html");
	});
}
