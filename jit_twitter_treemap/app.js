var  io = require("socket.io"),
express = require('express'),
 static = require("node-static"),
    url = require("url"),
   http = require("http"),
    sys = require("sys"),
Twitter = require("twitter-node").TwitterNode,
   port = 8000;

// Create server
var app = express.createServer();

var USERNAME = process.ARGV[2];
var PASSWORD = process.ARGV[3];

if (!USERNAME || !PASSWORD) {
	return sys.puts("Usage: node app.js <twitter_username> <twitter_password>")
}

var twit = new Twitter({
	user: USERNAME, 
	password:  PASSWORD,
	follow: [],
	locations: [-157.86, 21.31, -156.86, 22.31] // Track Hawaii
});

app.configure(function() {
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: "hicapacityrocks"}));
});

app.configure('development', function() {
    app.use(express.static(__dirname + '/public', { maxAge: 31557600000 }));
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.render('index.ejs', {
        locals: {}
    });
});

app.get('/favicon.ico', function(req, res) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end();
});

var sio = io.listen(app); 
sio.sockets.on('connection', function(socket) {
    
  /*var random = setInterval(function () {
    socket.volatile.emit('message', '');
  }, 1000);
*/
	
  socket.on('disconnect', function () {
    clearInterval(random);
  });
});

twit.addListener('tweet', function(tweet) {
	console.log("tweet received");
	sio.sockets.emit('message', tweet);
}).stream(); 

twit.addListener('error', function(error) {
    console.log(error.message);
});

app.listen(port);
