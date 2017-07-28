var socket = io();
socket.on('connect',function(){
	console.log('Connected to the server');
});

socket.on('disconnect', function(){
	console.log('Disconnected from the server');
});

socket.on('newMessage', function(message){
	console.log('New message : ', message);
	var li = jQuery('<li></li>');
	li.text(`${message.from} : ${message.text}`);
	jQuery('#messages').append(li);
});

jQuery('#messageForm').on('submit', function(ev){
	ev.preventDefault();
	socket.emit('createMessage', { 
		from : "Slimane",
		text : jQuery('[name=content]').val()
		}, function (){});
});