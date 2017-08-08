//Socket connection
var socket = io();
//Init the footer
initFooter();
//Init listeners for every tab 
initTabs();
//Add listeners on sockeet object
initSocket();
//Add listeners on buttons (join and about)
initButtons();

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

function initSocket()
{
  socket.on('getRoomsResponse', function(rooms){
    addActiveRooms(rooms);
  });
}

function addActiveRooms(rooms)
{
  var roomsSelect = byId(ROOMS_SELECT_ID);
  var option;
  roomsSelect.innerHTML = "";
  if (rooms.length == 0)
  {
    roomsSelect.setAttribute('disabled', 'on');
    option = document.createElement("option");
    option.innerHTML = NO_ROOM_MSG;
    roomsSelect.appendChild(option);
  }
  else
  {
    roomsSelect.removeAttribute('disabled');
    for (var i = 0; i < rooms.length; i++) {
      option = document.createElement("option");
      option.value = rooms[i];
      option.innerHTML = rooms[i];
      roomsSelect.appendChild(option);
    }
  }
}

function initButtons()
{
  var join, about, uploadField, upload;

  uploadField = byId(UPLOAD_FIELD_ID);
  uploadField.onchange = function(){
    if (this.value)
      verifyFile(this);
  };

  upload = byId(UPLOAD_BUTTON_ID);
  upload.onclick = function () {
    uploadField.click();
  };

  about = byId(ABOUT_BUTTON_ID);
  about.onclick = function(){ $('#aboutModal').modal('show'); }

  join = byId(JOIN_BUTTON_ID);
  join.onclick = function(){ joinFunction(ENTER_CODE); }
}

function verifyFile(uploadField) {
  var fileName = uploadField.value;
  var extension = fileName.substr(fileName.lastIndexOf('.')).toLowerCase();
  
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
    
  }else{
    uploadField.value = null;
    $('#pictureErrorModal').modal('show');
    uploadField.click();
  }
}

function joinFunction(code)
{
  if (code != ENTER_CODE)
    return;
  var displayName = byId(DISPLAY_NAME).value;
  if (!displayName.trim().length)
  {
    $('#nameRequiredModal').modal('show');
    return;
  }

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

  submit(displayName, roomName);
}

function submit(displayName, roomName)
{
  if (!roomName.trim().length)
  {
    $('#roomRequiredModal').modal('show');
    return;
  }
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
                  alert('Unable to upload your photo');

                var url = 'chat.html?'+jQuery.param(params);
                window.location.href = url;
            }
        });
  }else{
    var url = 'chat.html?'+jQuery.param(params);
    window.location.href = url;
  }
}