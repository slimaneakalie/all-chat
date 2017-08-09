/*
 * Welcome crazy boy
 * @file This is our cool script, be hungry to read it and to feel it.
 * @copyright AKALIA Slimane
*/

//Require modules
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const uuidv1 = require('uuid/v1');
//Other constants
const DEFAULT_UPLOAD_NAME = uuidv1();
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
const publicPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

//Set the properties of multer
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UPLOAD_DIR);
    },
    filename: function (req, file, callback){
        callback(null, DEFAULT_UPLOAD_NAME);
    }
});

const upload = multer({storage}).array("upload", 3);

//Create a users instance
var users = new Users();
//Global variable to the admin user
var adminUser = { id : uuidv1(), name : 'Admin'};
//Set the server port
if (!process.env.PORT)
	process.env.PORT = 300;
//Set the public path
app.use(express.static(publicPath));
//Use JSON parsing
app.use(bodyParser.json());

//Handle the POST request to upload the user's photo
app.post("/upload", function (req, res) {
	//Call multer upload function
    upload(req, res, function (err) { 
    	//If there is an error send it to the user
        if (err){
        	console.log(err);
            return res.send({ err : "Something went wrong!"}); 
        }
        else
        {
        	//Rename the file
        	var newUuid = uuidv1();
        	var newPath = path.join(UPLOAD_DIR, newUuid);
        	var oldPath = path.join(UPLOAD_DIR, DEFAULT_UPLOAD_NAME)
        	fs.rename(oldPath, newPath, function (){
        		res.send({ fileName : newUuid });
        	});
        }
    }); 
});

//Add listeners after socket connection
io.on('connection', (socket) =>{
	//Create message listener
	socket.on('createMessage', (message, callback) => {
		//Get the sender
		user = users.getUser(socket.id);
		//If the message is not empty then send it
		if ( user && isRealString(message.text) ){
			io.to(user.room).emit('newMessage', generateMessage(user, message.text));
			callback();
		}
	});
	//Create location message listener
	socket.on('createLocationMessage', function(coordinates){
		//Get the sender
		user = users.getUser(socket.id);
		//Generate the location message
		if (user)
			io.to(user.room).emit('newLocationMessage', generateLocationMessage(user, coordinates.latitude, coordinates.longitude));
	});
	//Join listener
	socket.on ('join', function(params, callback){
		//Verify the data of the request
		if (!isRealString(params.name) || !isRealString(params.room))
			return callback('Name and room name are required');
		//Call the join function of Node-JS sockets
		socket.join(params.room);
		//Add the user into the users collection
		users.addUser(socket.id, params.name, params.room, params.n);
		//Emit a message for every body in the room to update the users list
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		//Emit a welcome message to the new user
		socket.emit('newMessage', generateMessage(adminUser, "Welcome to the chat app") );
		//Notify the others in the same room that a new user has joined
		socket.broadcast.to(params.room).emit('newMessage', generateMessage (adminUser, `${params.name} has joined`) );
		callback();
	});
	//Disconnect listener
	socket.on('disconnect', () => {
		//Remove the user from the collection
		var user = users.removeUser(socket.id);
		if (user)
		{
			//Remove the user's photo if exists
			if (user.fileName && user.fileName.length)
			{
				var file = path.join(UPLOAD_DIR, user.fileName);
				fs.exists(file, (exists) => {
					if (exists)
						fs.unlink(file, (err) => {
  							if (err) throw err
  						});
				});
				
			}
			//Emit a message for every body in the room to update the users list
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			//Notify the others in the same room that a new user has left
			socket.broadcast.to(user.room).emit('newMessage', generateMessage (adminUser, `${user.name} has left`) );
		}
	});
	//Get rooms listener
	socket.on('getRooms', () => {
		//Send active rooms to the demander
		socket.emit('getRoomsResponse', users.getRooms());
	});
	
});

//Start the server
server.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});