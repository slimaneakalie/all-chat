/*
 * Welcome crazy boy
 * @file This is our cool script, be hungry to read it and to feel it.
 * @copyright AKALIA Slimane
*/

//Get the socket variable from /socket.io/socket.io.js
var socket = io();
//Get the messages panel by ID
var messages = jQuery('#'+MESSAGES_ID);
//Call the initialization functions
initSockets();
initMessages();
initButtons();

//Initialize socket listeners
function initSockets() {
	//On connect listener
	socket.on('connect',function(){
		//Deparam the GET request
		var params = jQuery.deparam(window.location.search);
		//Sent the message to join the room
		socket.emit(JOIN_EVENT, params, function(err){
			/* If there is any error in the data passed to the server
			   , then show the error and redirect the user to the home page
			*/
			if (err){
				alert(err);
				window.location.href = ROOT_DIR;
			}
		});
	});

	//Text message listener
	socket.on(NEW_MSG_EVENT, function(message){
		//Get the object to render in the template
		var obj = getNewMessageObject(message);
		obj.text = message.text;
		//Render the template
		renderTemplate(NORMAL_MSG_TEMPLATE, obj);
	});

	//Location message listener
	socket.on(NEW_LOCATION_MSG_EVENT, function(message){
		//Get the object to render in the template
		var obj = getNewMessageObject(message);
		obj.url = message.url;
		//Render the template
		renderTemplate(LOCATION_MSG_TEMPLATE, obj);
	});

	//Listener to update the active users list
	socket.on(UPDATE_USER_LIST_EVENT, function(users){
		//Create an unordred list
		var ul = jQuery('<ul></ul>');
		//Add an item list
		users.forEach(function (user){
			//Create an image item
			img = jQuery('<img/>');
			//Set the photo
			if (user.fileName && user.fileName.length)
				img.attr(SRC_ATTR, UPLOAD_DIR+user.fileName);
			else
				img.attr(SRC_ATTR, USER_ICON);
			//Set the class attribute (Bootstrap class)
			img.attr(CLASS_ATTR, 'rounded-circle img-fluid userMini');
			//Create the label that contains the user's name
			label = jQuery('<label></label>');
			label.html('&nbsp;'+user.name);
			//Create the list item
			li = jQuery('<li></li>');
			//Set the class attribute
			li.attr(CLASS_ATTR, USERS_CLASS_NAME);
			/* Set the log attribute to use it to calculate the duration of 
			connection by Moment library*/
			li.attr(LOG_ATTR, ''+user.logginAt);
			//Add the message and the photo to the list item
			li.append(img);
			li.append(label);
			//Add the list item to the unordred list
			ul.append(li);
		});
		//Add the unordred list 
		jQuery('#'+USERS_LABEL_ID).html(ul);
		//Add listeners to the user list to show a modal
		initUsers();
	});
}
	
//Function to initialize the message panel
function initMessages() {
	//Local variables
	var messageTextArea = jQuery('[name=content]');
	var messageForm = jQuery('#'+MSG_FORM_ID);
	//Manage the keydown event
	messageTextArea.keydown(function(ev){
		/* If the pressed key is enter then we should add the possibility
		   to add a new line character */
		if (ev.keyCode == ENTER_CODE)
		{
			//Prevent the default event
			ev.preventDefault();
			/* If we have a shift pressed on the same time then we should create a new line
			   and scroll to the bottom
			*/
			if (ev.shiftKey)
			{
		    	$(this).val($(this).val() + "\n");
		    	$(this).scrollTop($(this)[0].scrollHeight);
	  		}
	  		//If there is no shift pressed then we should send the current message
	  		else
				messageForm.submit();
		}
	});

	//Add the listener to send a message
	messageForm.on('submit', function(ev){
		//Prevent the default event
		ev.preventDefault();
		//Get the message value
		var messageVal = messageTextArea.val();
		//Verify the message
		var str = messageVal.replace(/\n/g, '');
		if (!str.trim().length)
			return;
		//Send the message to the server
		socket.emit(CREATE_MSG_EVENT, {
				text : messageVal.replace(/\n/g, NEW_HTML_LINE)
			}, function (){
				messageTextArea.val('');
			});
	});
}

//Function to add the listeners to the buttons
function initButtons() {
	//Get the sendLocation button by ID
	var sendLocation = jQuery('#'+SEND_LOCATION_ID);
	//Add on click listener
	sendLocation.on('click', function(){
		/* If the user's browser does not allows the geolocation API then
		   show an error */
		if (!navigator.geolocation)
			return alert(GEOLOCATION_NOT_ALLOWED);
		//Else we should disable the sendLocation button until getting the position
		sendLocation.attr(DISABLED_ATTR, DISABLED_ATTR).text(SEND_LOCATION_LABEL+' ...');
		//Getting the current position
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

//Scroll to bottom function, we call this function after getting a new message
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

//Add Listeners on every user item
function initUsers()
{
	//Get all the collection by the class name
	var tabUsers = byClass(USERS_CLASS_NAME);
	//Loop to add a listener on every single user
	for (var i = 0; i < tabUsers.length; i++) {
		tabUsers[i].onclick = function() {
			var children = this.children;
			//Modify the photo in the modal
			var modalImg = byId(USERMODALIMG);
			modalImg.src = children[0].src
			//Modif the title of the modal
			var modalTitle = byId(USERNAME_MODAL_ID);
			modalTitle.innerHTML = children[1].innerHTML;
			// Modify the content of the modal (calculate the duration of connection )
			var modalTxt = byId(USER_MODAL_TXT_ID);
			modalTxt.innerHTML = "Active "+moment(this.getAttribute(LOG_ATTR)).fromNow();
			//Show the final modal
			$('#'+USER_MODAL_ID).modal('show');
		};
	}
}

//Function that used to build the object to render in the message template
function getNewMessageObject(message)
{
	//Initialize the object
	var obj = {
		senderId : message.from.id,
		from : message.from.name,
		createdAt : moment(message.createdAt).format(MOMENT_DATE_FORMAT),
		itemClass : CHATLOG_ENTRY_CLASS
	}

	/* Set the class of message (gray background in the left or blue background in the right)
	   , We should see the class of last message
	*/
	var last = messages.children('li:last-child');
	if (last.length)
	{
		var lastClass = last.attr(CLASS_ATTR);
		if (last.attr(SENDER_ID_ATTR) == obj.senderId)
			obj.itemClass = lastClass;
		else if (lastClass == CHATLOG_ENTRY_CLASS)
			obj.itemClass += ' '+CHATLOG_ENTRY_MINE_CLASS;
	}
	//Add the photo of the sender
	if (message.from.fileName)
		obj.imgSrc = UPLOAD_DIR+message.from.fileName;
	else
		obj.imgSrc = USER_ICON;
	//Return the final object
	return obj;
}

//Function to render a Moustache-JS template
function renderTemplate(templateId, obj)
{
	//Get the template by ID
	var template = jQuery('#'+templateId).html();
	//Render Moustache-JS template
	var html = Mustache.render(template, obj);
	//Add the result of rendering into the messages panel
	messages.append(html);
	//Scroll to bottom
	scrollToBottom();
	//Init tooltips to show bootstrap titles
	$('[data-toggle="tooltip"]').tooltip();
}