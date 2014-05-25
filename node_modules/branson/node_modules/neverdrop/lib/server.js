var tls = require('tls');

var DELIMITER = '\x04';

/**
This function mimics the functionality of tls.createServer() and preconfigures all new connections to work with neverdrop Sockets.
*/
module.exports.createServer = function(options, onSecureConnectCb){
	var server = tls.createServer(options, function(socket){
		socket.setNoDelay(true);
		var body = '';
		var msgFlag = false;
		var defaultSendMsgFlag = false;
		
		function onData(data){
			var string = data.toString();
			var index = 0;
			var startIndex = 0;
			while(index < string.length){
				index = string.indexOf(DELIMITER, index);
				if(index === -1) break;
				else {
					body += string.substring(startIndex, index);;
					if(body === ''){
						socket.emit('heartbeat');
						socket.write('');
					}else if(body === 'neverdropmsg') msgFlag = true;
					else{
						if(msgFlag){
							socket.emit('message', body);
							msgFlag = false;
						}else socket.emit('data2', body);
					}
					body = '';
					index++;
					startIndex = index;
				}
				index++;
			}
			body += string.substring(startIndex);
		}
		socket.on('data', onData);
		
		var oldRemoveAllListeners = socket.removeAllListeners;
		socket.removeAllListeners = function(event){
			oldRemoveAllListeners.call(socket, event);
			if(event === data) socket.addListener('data', onData);
		}
		
		var oldWrite = socket.write;
		function write(buf){
			if(defaultSendMsgFlag) oldWrite.call(socket, 'neverdropmsg' + DELIMITER);
			oldWrite.call(socket, buf.toString() + DELIMITER);
		}
		socket.write = write;
		
		var oldAddListener = socket.addListener;
		socket.addListener = function(event, fnc){
			if(event === 'data' && fnc !== onData) event = 'data2';
			oldAddListener.call(socket, event, fnc);
		}
		socket.on = socket.addListener;
		
		function message(string){
			socket.write('neverdropmsg');
			socket.write(string);
		}
		socket.message = message;
		
		socket.defaultMessage = function(bool){
			defaultSendMsgFlag = bool;
			if(bool){
				socket.message = write;
			}else{
				socket.message = message;
			}
		}

		if(onSecureConnectCb) onSecureConnectCb(socket);
	});
	return server;
}