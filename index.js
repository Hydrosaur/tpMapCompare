var express = require('express');

var app = express();

var path = require('path');

var http = require('http').Server(app);

var PORT =  3030;

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use('/tiles', express.static(path.join(__dirname, 'tiles')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/main.js', function(req, res){
	res.sendFile(__dirname + '/main.js');
});

app.get('/map.png', function(req, res){
	res.sendFile(__dirname + '/map.png');
});

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
});