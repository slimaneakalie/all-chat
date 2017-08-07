const CONTENT_CLASS_NAME = "tabcontent";
const LINKS_CLASS_NAME   = "tablinks";
const NONE_DISPLAY_CSS   = "none";
const BLOCK_DISPLAY_CSS  = "block";
const ACTIVE_CLASS       = " active";
const LINK               = "Link";
const TAB                = "Tab";
const ENTER_ROOM_LINK    = "enterRoomLink";
const STATIC_ROOM_NAME   = "staticRoom";
const DISPLAY_NAME       = "displayName";
const ROOMS_SELECT_ID    = "roomsSelect";
const ABOUT_BUTTON_ID    = "about";
const JOIN_BUTTON_ID     = "join";
const UPLOAD_BUTTON_ID   = "uploadPhotoButton";
const UPLOAD_FIELD_ID    = "uploadPhoto";
const CURRENT_PHOTO_ID   = "currentPhoto";
const USERNAME_MODAL_ID  = "userNameModal";
const USERMODALIMG       = "userModalImg";
const USER_MODAL_TXT_ID  = "userModalTxt";
const NO_ROOM_MSG        = "No active room for now";
const ENTER_CODE         = 13;
const USERS_CLASS_NAME   = 'newUser';
const PICTURES_ALLOWED   = ['.jpg', '.png', '.jpeg', '.bmp', '.gif'];

//Dom getters
function byId(id) { return document.getElementById(id); }
function byName(name) { return document.getElementsByName(name); }
function byClass(className) { return document.getElementsByClassName(className); }