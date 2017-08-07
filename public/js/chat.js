var socket = io();
socket.frej = "ABC12333";
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

socket.on('newMessage', function(message){
	var obj = getNewMessageObject(message);
	obj.text = message.text;
	
	renderTemplate('messageTemplate', obj);
});

socket.on('newLocationMessage', function(message){
	var obj = getNewMessageObject(message);
	obj.url = message.url;

	renderTemplate('locationMsgTemplate', obj);
});

socket.on('updateUserList', function(users){
	var ul = jQuery('<ul></ul>');
	console.log('Users array : ');
	console.log(users);
	users.forEach(function (user){		
		img = jQuery('<img/>');
		var test = false;

		if (user.fileName && user.fileName.length)
			img.attr('src', 'uploads/'+user.fileName);
		else
			img.attr('src', 'images/user_icon.png');
		img.attr('class', 'rounded-circle img-fluid userMini');

		label = jQuery('<label></label>');
		label.html('&nbsp;'+user.name);

		li = jQuery('<li></li>');
		li.attr('class', USERS_CLASS_NAME);
		li.attr('log', ''+user.logginAt);

		li.append(img);
		li.append(label);

		ul.append(li);
	});

	jQuery('#users').html(ul);
	initUsers();
});

var messageTextArea = jQuery('[name=content]');
var messageForm = jQuery('#messageForm');

messageTextArea.keydown(function(ev){
	if (ev.keyCode == ENTER_CODE)
	{
		ev.preventDefault();
		if (ev.shiftKey){
	    	$(this).val($(this).val() + "\n");
	    	$(this).scrollTop($(this)[0].scrollHeight);
  		}
  		else
			messageForm.submit();
	}
});

messageForm.on('submit', function(ev){
	ev.preventDefault();
	
	socket.emit('createMessage', { 
			text : messageTextArea.val().replace(/\n/g, '<br />')
		}, function (){
			messageTextArea.val('');
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

function initUsers()
{
	var tabUsers = byClass(USERS_CLASS_NAME);

	for (var i = 0; i < tabUsers.length; i++) {
		tabUsers[i].onclick = function() {
			var children = this.children;
			var modalImg = byId(USERMODALIMG);
			modalImg.src = children[0].src

			var modalTitle = byId(USERNAME_MODAL_ID);
			modalTitle.innerHTML = children[1].innerHTML;

			var modalTxt = byId(USER_MODAL_TXT_ID);
			modalTxt.innerHTML = "Active "+moment(this.getAttribute('log')).fromNow();
			console.log("this.getAttribute('log') : "+this.getAttribute('log')+" moment("+this.getAttribute('log')+" = "+moment(this.log).fromNow());
			$('#userModal').modal('show');
		};
	}
}

function getNewMessageObject(message)
{
	var obj = {
		senderId : message.from.id,
		from : message.from.name,
		createdAt : moment(message.createdAt).format('h:mm a'),
		itemClass : 'ChatLog__entry'
	}

	var messages = jQuery('#messages');
	var last = messages.children('li:last-child');
	if (last.length)
	{
		var lastClass = last.attr('class');
		if (last.attr('senderId') == obj.senderId)
			obj.itemClass = lastClass;
		else if (lastClass == 'ChatLog__entry')
			obj.itemClass += ' ChatLog__entry_mine';
	}

	if (message.from.fileName)
		obj.imgSrc = 'uploads/'+message.from.fileName;
	else
		obj.imgSrc = 'images/user_icon.png';

	return obj;
}

function renderTemplate(templateId, obj)
{
	var template = jQuery('#'+templateId).html();
	var html = Mustache.render(template, obj);
	jQuery('#messages').append(html);
	scrollToBottom();
	$('[data-toggle="tooltip"]').tooltip();
}