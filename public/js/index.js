var socket = io();
socket.on('connect',function(){
	console.log('Connected to the server');
});

socket.on('disconnect', function(){
	console.log('Disconnected from the server');
});

function renderTemplate(templateId, obj)
{
	var template = jQuery('#'+templateId).html();
	var html = Mustache.render(template, obj);
	jQuery('#messages').append(html);
}

socket.on('newMessage', function(message){
	var obj = {
		text : message.text,
		from : message.from,
		createdAt : moment(message.createdAt).format('h:mm a')
	}
	renderTemplate('messageTemplate', obj);
});

socket.on('newLocationMessage', function(message){
	var obj = {
		url : message.url,
		from : message.from,
		createdAt : moment(message.createdAt).format('h:mm a')
	}
	renderTemplate('locationMsgTemplate', obj);
});

var messageTextField = jQuery('[name=content]');
jQuery('#messageForm').on('submit', function(ev){
	ev.preventDefault();
	socket.emit('createMessage', { 
		from : "Slimane",
		text : messageTextField.val()
		}, function (){
			messageTextField.val('');
		});
});

var sendLocation = jQuery('#sendLocation');
sendLocation.on('click', function(){
	if (!navigator.geolocation)
		return alert('Geolocation not supported by your browser');
	sendLocation.attr('disabled', 'disabled').text('Send location ...');
	
	navigator.geolocation.getCurrentPosition(function(position){
		sendLocation.removeAttr('disabled').text('Send location');
		socket.emit('createLocationMessage', {
			latitude : position.coords.latitude,
			longitude : position.coords.longitude
		});
		console.log(position);
	}, function(){
		sendLocation.removeAttr('disabled').text('Send location');
		sendLocation.val('Send location');
		alert('Unable to fetch geolocation');
	});
});