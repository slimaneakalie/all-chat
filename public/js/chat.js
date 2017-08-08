var socket = io();
var messages = jQuery('#'+MESSAGES_ID);
initSockets();
initMessages();
initButtons();

function initSockets() {
	socket.on('connect',function(){
		var params = jQuery.deparam(window.location.search);
		socket.emit(JOIN_EVENT, params, function(err){
			if (err){
				alert(err);
				window.location.href = ROOT_DIR;
			}
		});
	});

	socket.on('disconnect', function(){});

	socket.on(NEW_MSG_EVENT, function(message){
		var obj = getNewMessageObject(message);
		obj.text = message.text;
		
		renderTemplate(NORMAL_MSG_TEMPLATE, obj);
	});

	socket.on(NEW_LOCATION_MSG_EVENT, function(message){
		var obj = getNewMessageObject(message);
		obj.url = message.url;

		renderTemplate(LOCATION_MSG_TEMPLATE, obj);
	});

	socket.on(UPDATE_USER_LIST_EVENT, function(users){
		var ul = jQuery('<ul></ul>');

		users.forEach(function (user){		
			img = jQuery('<img/>');
			if (user.fileName && user.fileName.length)
				img.attr(SRC_ATTR, UPLOAD_DIR+user.fileName);
			else
				img.attr(SRC_ATTR, USER_ICON);
			img.attr(CLASS_ATTR, 'rounded-circle img-fluid userMini');

			label = jQuery('<label></label>');
			label.html('&nbsp;'+user.name);

			li = jQuery('<li></li>');
			li.attr(CLASS_ATTR, USERS_CLASS_NAME);
			li.attr(LOG_ATTR, ''+user.logginAt);

			li.append(img);
			li.append(label);

			ul.append(li);
		});

		jQuery('#'+USERS_LABEL_ID).html(ul);
		initUsers();
	});
}
	

function initMessages() {
	var messageTextArea = jQuery('[name=content]');
	var messageForm = jQuery('#'+MSG_FORM_ID);

	messageTextArea.keydown(function(ev){
		if (ev.keyCode == ENTER_CODE)
		{
			ev.preventDefault();
			if (ev.shiftKey)
			{
		    	$(this).val($(this).val() + "\n");
		    	$(this).scrollTop($(this)[0].scrollHeight);
	  		}
	  		else
				messageForm.submit();
		}
	});

	messageForm.on('submit', function(ev){
		ev.preventDefault();
		
		socket.emit(CREATE_MSG_EVENT, { 
				text : messageTextArea.val().replace(/\n/g, NEW_HTML_LINE)
			}, function (){
				messageTextArea.val('');
			});
	});
}
	
function initButtons(argument) {
	var sendLocation = jQuery('#'+SEND_LOCATION_ID);
	sendLocation.on('click', function(){
		if (!navigator.geolocation)
			return alert(GEOLOCATION_NOT_ALLOWED);
		sendLocation.attr(DISABLED_ATTR, DISABLED_ATTR).text(SEND_LOCATION_LABEL+' ...');
		
		navigator.geolocation.getCurrentPosition(function(position){
			sendLocation.removeAttr(DISABLED_ATTR).text(SEND_LOCATION_LABEL);
			socket.emit(CREATE_LOCATION_MSG_EVENT, {
				latitude : position.coords.latitude,
				longitude : position.coords.longitude
			});
			console.log(position);
		}, function(){
			sendLocation.removeAttr(DISABLED_ATTR).text(SEND_LOCATION_LABEL);
			sendLocation.val(SEND_LOCATION_LABEL);
			alert(UNABLE_FETCH_LOCATION);
		});
	});
}

function scrollToBottom()
{
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
			modalTxt.innerHTML = "Active "+moment(this.getAttribute(LOG_ATTR)).fromNow();
			$('#'+USER_MODAL_ID).modal('show');
		};
	}
}

function getNewMessageObject(message)
{
	var obj = {
		senderId : message.from.id,
		from : message.from.name,
		createdAt : moment(message.createdAt).format(MOMENT_DATE_FORMAT),
		itemClass : CHATLOG_ENTRY_CLASS
	}

	var last = messages.children('li:last-child');
	if (last.length)
	{
		var lastClass = last.attr(CLASS_ATTR);
		if (last.attr(SENDER_ID_ATTR) == obj.senderId)
			obj.itemClass = lastClass;
		else if (lastClass == CHATLOG_ENTRY_CLASS)
			obj.itemClass += ' '+CHATLOG_ENTRY_MINE_CLASS;
	}

	if (message.from.fileName)
		obj.imgSrc = UPLOAD_DIR+message.from.fileName;
	else
		obj.imgSrc = USER_ICON;

	return obj;
}

function renderTemplate(templateId, obj)
{
	var template = jQuery('#'+templateId).html();
	var html = Mustache.render(template, obj);
	messages.append(html);
	scrollToBottom();

	$('[data-toggle="tooltip"]').tooltip();
}