var socket = io();
socket.on('connect',function(){
	console.log('Connected to the server');
});

socket.on('disconnect', function(){
	console.log('Disconnected from the server');
});

socket.on('newMessage', function(message){
	var li = jQuery('<li></li>');
	var messages = jQuery('#messages');

	li.text(`${message.from} : ${message.text}`);
	messages.append(li);
});

socket.on('newLocationMessage', function(message){
	var li = jQuery('<li></li>');
	var a = jQuery('<a>My current location</a>');
	var messages = jQuery('#messages');
	
	a.attr('target', '_blank');
	a.attr('href', message.url);
	li.text(`${message.from} : `);
	li.append(a);
	messages.append(li);
});

jQuery('#messageForm').on('submit', function(ev){
	ev.preventDefault();
	socket.emit('createMessage', { 
		from : "Slimane",
		text : jQuery('[name=content]').val()
		}, function (){});
});

var sendLocation = jQuery('#sendLocation');
sendLocation.on('click', function(){
	if (!navigator.geolocation)
		return alert('Geolocation not supported by your browser');
	navigator.geolocation.getCurrentPosition(function(position){
		socket.emit('createLocationMessage', {
			latitude : position.coords.latitude,
			longitude : position.coords.longitude
		});
		console.log(position);
	}, function(){
		alert('Unable to fetch geolocation');
	});
});