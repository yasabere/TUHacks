var neverDrop = require('./../neverdrop.js');
var fs = require('fs');

var clientOptions = {
	host: 'localhost',
	port: 3547,
	reconnectGrow: 2,
	heartbeatTimeout: 3000,
	reconnectCap: 7000,
	reconnectTime: 1000,
	rejectUnauthorized: false,
	ca: [fs.readFileSync('./cert/test.crt')],
	requestCert: true,
	agent: false
}

var serverOptions = {
	key: fs.readFileSync('./cert/test.key'),
	cert: fs.readFileSync('./cert/test.crt'),
	rejectUnauthorized: false,
	requestCert: true,
};

var server = neverDrop.createServer(serverOptions, function(socket){
	socket.on('data', function(data){
		console.log('server data: ', data.toString())
	});
	socket.on('message', function(data){
		console.log('server message: ', data);
	});
	socket.on('heartbeat', function(){
		console.log('server hb');
	});
});
server.listen(3547);

var socket = neverDrop.connect(clientOptions);
socket.defaultMessage(true);
socket.message('hithere|message');
socket.defaultMessage(false);
var fileStream = fs.createReadStream('test.js');
fileStream.on('close', function(){
	fileStream.unpipe();
	socket.message('start again');
});
fileStream.pipe(socket, {end: false});
