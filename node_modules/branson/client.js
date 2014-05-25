#!/usr/bin/env node

var neverdrop = require('neverdrop');
var fs = require('fs');
var path = require('path');

var options = {
	host: 'thecodebutler.com',
	port: 3546,
	ca: [fs.readFileSync(path.join(__dirname, 'tls-server.crt'))],
	rejectUnauthorized: false,
	requestCert: true,
    agent: false
}

var key;
var printFlag = true;
var socket = neverdrop.connect(options);

function onConnect(){
	key = require('MD5')((new Date()).getTime() + Math.floor((Math.random() * 111) + 1) + 'shhh');
	socket.message(JSON.stringify({type: 'connect', key: key}));
	if(printFlag){
		printFlag = false;
		var url = 'http://thecodebutler.com/' + key + '/';
		console.log('access this directory at: \n' + url);
		if(process.platform.indexOf('win') !== -1){
			var exec = require('child_process').exec;
			exec('start /max ' + url, function (error, stdout, stderr) {});
		}
	}
}

function onMessage(data){
	var payload = JSON.parse(data);
	if(payload.command === 'areyouthere'){
		socket.message(JSON.stringify({type: 'areyouthere', areyouthere: true})); 
	}else if(payload.command === 'ls'){
		fs.readdir(path.join(process.cwd(), payload.path), function(err, fileNames){
			if(err){
				console.log(err);
				socket.message(JSON.stringify({type: 'ls', error: err}));
			}else{
				var files = [];
				var folders = [];
				for(var i=0; i<fileNames.length; i++){
					var file = {};
					file.name = fileNames[i];
					var ext = path.extname(file.name||'').split('.');
					file.extension = ext[ext.length - 1];
					try{
						var stats = fs.statSync(path.join(process.cwd(), payload.path, fileNames[i]));
						file.isDir = stats.isDirectory();
						file.size = stats.size;
						file.ctime = stats.ctime;
						file.mtime = stats.mtime;
						if(file.isDir) files.push(file);
						else folders.push(file);
					}catch(e){
						console.log(e);
					}
				};
				for(var i=0; i<folders.length; i++){
					files.push(folders[i]);
				}
				socket.message(JSON.stringify({type: 'ls', files: files}));
			}
		});
	}else if(payload.command === 'file'){
		fs.readFile(path.join(process.cwd(), payload.path), function(err, data){
			if(err) socket.message(JSON.stringify({type: 'file', err: err}));
			else socket.message(JSON.stringify({type: 'file', text: data.toString()})); //TODO: should be piped
		});
	}else if(payload.command === 'save'){
		fs.writeFile(path.join(process.cwd(), payload.path), payload.text, function (err) { //TODO: should be piped
			if(err) socket.message(JSON.stringify({type: 'save', err: err}));
			else socket.message(JSON.stringify({type: 'save', err: null}));
		});
	}else{
		console.log('unrecognized command: ' + payload.command);
	}
}
socket.on('message', onMessage);
socket.on('secureConnect', onConnect);