/*
 * Welcome crazy boy
 * @file This is our cool script, be hungry to read it and to feel it.
 * @copyright AKALIA Slimane
*/

//Socket connection
var socket = io();
//Init the footer
initFooter();
//Init listeners for every tab 
initTabs();
//Add listeners on sockeet object
initSocket();
//Add listeners on buttons (join, about and the file selector)
initButtons();

//Function to initialize the footer
function initFooter() {
  //Get the footer element
  var footer = byId(FOOTER_ID);
  //Set the copyright label
  if (footer){
    //Get the current year
    var year = new Date().getFullYear();
    //Modify the label
    footer.innerHTML = "&copy; "+year+", AKALIA Slimane";
  }
}

//Function to initialize the listener to navigate between tabs
function initTabs()
{
  //Local variables
  var i, tablinks, enterRoomLink;
  //Get elements by class name
  tabLinks = byClass(LINKS_CLASS_NAME);
  //Loop to add onclick listeners 
  for (i = 0; i < tabLinks.length; i++)
    tabLinks[i].onclick = function(){ openTab(this); };

  var tmp = byId(DISPLAY_NAME);
  tmp.onkeyup = function(ev){ joinFunction(ev.keyCode); };

  tmp = byId(STATIC_ROOM_NAME);
  tmp.onkeyup = function(ev){ joinFunction(ev.keyCode); };
}

//Function to open a tab into the tabs menu
function openTab(linkButton)
{
  //Local variables
  var i, tabContent, tabLinks;
  //Get the content of every tab by class name
  tabContent = byClass(CONTENT_CLASS_NAME);
  //Hide every tab
  for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = NONE_DISPLAY_CSS;
  }
  //Get the links by class name
  tabLinks = byClass(LINKS_CLASS_NAME);
  //Remove the active class from every link
  for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(ACTIVE_CLASS, "");
  }
  //Get the tab associated to the link button clicked
  tabId = linkButton.id.replace(LINK, TAB);
  //Show the selected tab
  byId(tabId).style.display = BLOCK_DISPLAY_CSS;
  //Set the link button active
  linkButton.className += ACTIVE_CLASS;
  /* If the user want to enter a room then we should send a message to
     the server to get current rooms.
  */
  if (linkButton.id == ENTER_ROOM_LINK)
    socket.emit('getRooms', function (){});
}

//Add listeners on sockeet object
function initSocket()
{
  socket.on('getRoomsResponse', function(rooms){
    addActiveRooms(rooms);
  });
}

//Function to add active rooms into the select of index page
function addActiveRooms(rooms)
{
  //Get the rooms select by ID
  var roomsSelect = byId(ROOMS_SELECT_ID);
  var option;
  //Initialize the rooms select by an empty choice
  roomsSelect.innerHTML = "";
  
  if (rooms.length == 0)
  {
    //If there is no room then, disable the select and show a messsage to the user
    roomsSelect.setAttribute('disabled', 'on');
    option = document.createElement("option");
    option.innerHTML = NO_ROOM_MSG;
    roomsSelect.appendChild(option);
  }
  else
  {
    /* But, If there is at least one active room, then enable the rooms select
       and add the active rooms */
    roomsSelect.removeAttribute('disabled');
    for (var i = 0; i < rooms.length; i++) {
      option = document.createElement("option");
      option.value = rooms[i];
      option.innerHTML = rooms[i];
      roomsSelect.appendChild(option);
    }
  }
}

//Function to add listeners on buttons (join, about and the file selector)
function initButtons()
{
  //Variable declaration
  var join, about, uploadField, upload;
  //Add a listener to verify the uploaded file to the input field
  uploadField = byId(UPLOAD_FIELD_ID);
  uploadField.onchange = function(){
    if (this.value)
      verifyFile(this);
  };
  //Add a listener to show the file selector every time the upload button will be clicked
  upload = byId(UPLOAD_BUTTON_ID);
  upload.onclick = function () {
    uploadField.click();
  };
  //Add a listener on about button to show a bootstrap modal
  about = byId(ABOUT_BUTTON_ID);
  about.onclick = function(){ $('#aboutModal').modal('show'); }
  //Add a listener on join button
  join = byId(JOIN_BUTTON_ID);
  join.onclick = function(){ joinFunction(ENTER_CODE); }
}

//Function to verify that the uploaded file is an image
function verifyFile(uploadField) {
  //Get the file path
  var fileName = uploadField.value;
  //Get the extension of the file
  var extension = fileName.substr(fileName.lastIndexOf('.')).toLowerCase();
  //Test the extension
  for (var i = 0; i < PICTURES_ALLOWED.length; i++)
    if (extension === PICTURES_ALLOWED[i])
      break;
  if (i < PICTURES_ALLOWED.length)
  {
    var reader = new FileReader();
    reader.onload = function (e) {
        $('#'+CURRENT_PHOTO_ID)
        .attr('src', e.target.result)
        .width(230)
        .height(230);
    };
    reader.readAsDataURL(uploadField.files[0]);
    
  }
  //If there is an error then show it to the user
  else{
    uploadField.value = null;
    $('#pictureErrorModal').modal('show');
    uploadField.click();
  }
}

//The function that will be called when the user clicks on join button or enter key
function joinFunction(code)
{
  //Test the key code
  if (code != ENTER_CODE)
    return;
  //Test the validity of entered data
  //Verify the name
  var displayName = byId(DISPLAY_NAME).value;
  if (!displayName.trim().length)
  {
    $('#nameRequiredModal').modal('show');
    return;
  }
  //Get the room name
  var roomName;
  var activeTab = byClass(ACTIVE_CLASS)[0];

  if (activeTab.id == ENTER_ROOM_LINK)
  {
    var roomsSelect = byId(ROOMS_SELECT_ID);
    if (roomsSelect.disabled)
      roomName = '';
    else
      roomName = roomsSelect.options[roomsSelect.selectedIndex].value;
  }
  else
    roomName = byId(STATIC_ROOM_NAME).value;

  //Pass to the chat page
  submit(displayName, roomName);
}

//Function to pass to the chat page
function submit(displayName, roomName)
{
  //Verify the roomName, if there is an error show the modal
  if (!roomName.trim().length)
  {
    $('#roomRequiredModal').modal('show');
    return;
  }

  //Pass the GET request to the chat page
  var params = {name : displayName, room : roomName, n : ''};
  var uploadField = byId(UPLOAD_FIELD_ID);
  if (uploadField.value)
  {
    uploadField = $('#'+UPLOAD_FIELD_ID);

    console.dir(uploadField[0].files);
    var form = new FormData($('#formUpload')[0]);
    $.ajax({
            type: 'POST',
            url: '/upload',
            data: form,
            contentType: false,
            processData: false,
            success: function (data) {
                if (data.fileName)
                  params.n = data.fileName;
                else
                  alert(UNABLE_UPLOAD_PHOTO);

                var url = 'chat.html?'+jQuery.param(params);
                window.location.href = url;
            }
        });
  }else{
    var url = 'chat.html?'+jQuery.param(params);
    window.location.href = url;
  }
}