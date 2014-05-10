module.exports = function(app, express){
	app.use('/css', express.static(__dirname + '/css'));
	app.use('/html', express.static(__dirname + '/html'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use(express.cookieParser());
	app.use(express.session({secret: 'blokus'}));

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
