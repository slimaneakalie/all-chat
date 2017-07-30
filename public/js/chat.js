var socket = io();
socket.on('connect',function(){
	console.log('Connected to the server');
	var params = jQuery.deparam(window.location.search);
	socket.emit('join', params, function(err){
		if (err){
			alert(err);
			window.location.href = '/';
		}
		else
			console.log('No error');
	});
});

socket.on('disconnect', function(){
	console.log('Disconnected from the server');
});

function renderTemplate(templateId, obj)
{
	var template = jQuery('#'+templateId).html();
	var html = Mustache.render(template, obj);
	jQuery('#messages').append(html);
	scrollToBottom();
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

socket.on('updateUserList', function(users){
	var ul = jQuery('<ul></ul>');

	users.forEach(function (user){
		ul.append(jQuery('<li></li>').text(user));
	});

	jQuery('#users').html(ul);
});

var messageTextField = jQuery('[name=content]');
jQuery('#messageForm').on('submit', function(ev){
	ev.preventDefault();
	socket.emit('createMessage', { 
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

function scrollToBottom()
{
	var messages = jQuery('#messages');
	var newMessage = messages.children('li:last-child');

	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight)
		messages.scrollTop(scrollHeight);
}