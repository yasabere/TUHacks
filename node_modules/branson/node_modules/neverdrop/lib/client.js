var tls = require('tls');

var DELIMITER = '\x04';

/**
This function returns a preconfigured TLSSocket with (same as the result of tls.connect()). This socket will attempt to reconnect if it becomes disconnected according to
the additional options described below. The socket also supports sending and receiving messages to a neverdrop Server which will arrive exactly as they are sent.
Additional options:
	maxReconnectAttempts: max number of attempts that can be made to reconnect once the socket disconnects. The count resets after a successful connection attempt.
		Passing -1 will allow for infinite reconnect attempts, defaults to -1
	reconnectTime: initial time between reconnect attempts, defaults to 3 seconds
	reconnectGrow: factor to grow reconnectTime, defaults to 1
	reconnectCap: max cap on reconnectTime, defaults to 30 seconds
	heartbeatTimeout: time before heartbeats begin being sent, defaults to 30 seconds
*/
module.exports.connect = function(options, onConnectCb){
	var body = '';
	var reconnect = null;
	var socket;
	var heartbeatTimeout = options.heartbeatTimeout || 30000;
	var maxReconnectAttempts = options.maxReconnectAttempts || -1;
	var reconnectGrow = options.reconnectGrow || 1.2;
	var reconnectCap = options.reconnectCap || 30000;
	var reconnectTime = (options.reconnectTime || 3000)/reconnectGrow;
	var currentReconnectTime = reconnectTime;
	var msgFlag = false;
	var defaultSendMsgFlag = false;
	var reconnectCount = 0;
	
	function onSecureConnect(){
		reconnectCount = 0;
		clearTimeout(reconnect);
		reconnect = null;
		if(socket.authorized === true){
			socket.setNoDelay(true);
			socket.setTimeout(heartbeatTimeout);
			if(onConnectCb) onConnectCb();
		}else{
			console.log('error connecting to server');
			console.log(socket.authorizationError);
			socket.destroy();
		}
	}

	function onError(e){
		if(maxReconnectAttempts !== -1 && reconnectCount > maxReconnectAttempts) socket.destroy();
		else{
			reconnectCount++;
			clearTimeout(reconnect);
			currentReconnectTime *= reconnectGrow;
			if(currentReconnectTime > reconnectCap) currentReconnectTime = reconnectCap;
			reconnect = setTimeout(function(){
				socket.destroy();
				beginConnectionLoop();
			}, currentReconnectTime);
		}
	}
	
	function onTimeout(){
		socket.write('');
	}
	
	function onData(data){
		var string = data.toString();
		var index = 0;
		var startIndex = 0;
		while(index < string.length){
			index = string.indexOf(DELIMITER, index);
			if(index === -1) break;
			else {
				body += string.substring(startIndex, index);;
				if(body === '') socket.emit('heartbeat');
				else if(body === 'neverdropmsg') msgFlag = true;
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

	function beginConnectionLoop(){
		if(socket){
			var events = socket._events;
			socket = tls.connect(options);
			socket._events = events;
		}else{
			socket = tls.connect(options);
			socket.on('secureConnect', onSecureConnect);
			socket.on('error', onError);
			socket.on('timeout', onTimeout);
			socket.on('data', onData);
		}
		
		var oldRemoveAllListeners = socket.removeAllListeners;
		socket.removeAllListeners = function(event){
			oldRemoveAllListeners.call(socket, event);
			switch(event){
			case 'secureConnect':
				socket.on('secureConnect', onSecureConnect);
				break;
			case 'error':
				socket.on('error', onError);
				break;
			case 'timeout':
				socket.on('timeout', onTimeout);
				break;
			case 'data':
				socket.on('data', onData);
				break;
			}
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
	}
	beginConnectionLoop();	
	return socket;
}