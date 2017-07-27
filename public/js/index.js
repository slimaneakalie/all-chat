var socket = io();
socket.on('connect',function(){
	console.log('Connected to the server');
	//socket.emit('createMessage', { from : "slimane@gmail.com", text : "Hello nta !"});
});

socket.on('disconnect', function(){
	console.log('Disconnected from the server');
});

socket.on('newMessage', function(message){
	console.log('New message : ', message);
});