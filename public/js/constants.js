//Constants
const CONTENT_CLASS_NAME        = 'tabcontent';
const LINKS_CLASS_NAME          = 'tablinks';
const USERS_CLASS_NAME          = 'newUser';
const CHATLOG_ENTRY_CLASS       = 'ChatLog__entry';
const CHATLOG_ENTRY_MINE_CLASS  = 'ChatLog__entry_mine';

const NONE_DISPLAY_CSS          = 'none';
const BLOCK_DISPLAY_CSS         = 'block';
const ACTIVE_CLASS              = ' active';

const LINK                      = 'Link';
const TAB                       = 'Tab';

const ENTER_ROOM_LINK           = 'enterRoomLink';
const STATIC_ROOM_NAME          = 'staticRoom';
const DISPLAY_NAME              = 'displayName';

const ROOMS_SELECT_ID           = 'roomsSelect';
const ABOUT_BUTTON_ID           = 'about';
const JOIN_BUTTON_ID            = 'join';
const UPLOAD_BUTTON_ID          = 'uploadPhotoButton';
const UPLOAD_FIELD_ID           = 'uploadPhoto';
const CURRENT_PHOTO_ID          = 'currentPhoto';
const USERNAME_MODAL_ID         = 'userNameModal';
const USERMODALIMG              = 'userModalImg';
const USER_MODAL_TXT_ID         = 'userModalTxt';
const USER_MODAL_ID             = 'userModal';
const USERS_LABEL_ID            = 'users';
const MSG_FORM_ID   	        = 'messageForm';
const SEND_LOCATION_ID	        = 'sendLocation';
const MESSAGES_ID 		        = 'messages';
const FOOTER_ID                 = 'footer';

const GEOLOCATION_NOT_ALLOWED   = 'Geolocation not supported by your browser';
const NO_ROOM_MSG               = 'No active room for now';
const UNABLE_FETCH_LOCATION     = 'Unable to fetch geolocation';
const UNABLE_UPLOAD_PHOTO     = 'Unable to upload your photo';

const ENTER_CODE                = 13;


const PICTURES_ALLOWED          = ['.jpg', '.png', '.jpeg', '.bmp', '.gif'];
const ROOT_DIR                  = '/';

const NORMAL_MSG_TEMPLATE       = 'messageTemplate';
const LOCATION_MSG_TEMPLATE     = 'locationMsgTemplate';

const UPDATE_USER_LIST_EVENT    = 'updateUserList';
const NEW_LOCATION_MSG_EVENT    = 'newLocationMessage';
const CREATE_LOCATION_MSG_EVENT = 'createLocationMessage';
const NEW_MSG_EVENT             = 'newMessage';
const JOIN_EVENT			    = 'join';
const CREATE_MSG_EVENT          = 'createMessage';

const USER_ICON                 = 'images/user_icon.png';
const UPLOAD_DIR                = 'uploads/';

const SRC_ATTR                  = 'src';
const CLASS_ATTR                = 'class';
const LOG_ATTR 				    = 'log';
const DISABLED_ATTR 		    = 'disabled';
const SENDER_ID_ATTR 		    = 'senderId';

const NEW_HTML_LINE             = '<br />';

const SEND_LOCATION_LABEL       = 'Send location ...';

const MOMENT_DATE_FORMAT 		= 'h:mm a';

//Dom getters
function byId(id) { return document.getElementById(id); }
function byName(name) { return document.getElementsByName(name); }
function byClass(className) { return document.getElementsByClassName(className); }
