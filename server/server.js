const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const uuidv1 = require('uuid/v1');

const DEFAULT_UPLOAD_NAME = uuidv1();



const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

const publicPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UPLOAD_DIR);
    },
    filename: function (req, file, callback) {
        callback(null, DEFAULT_UPLOAD_NAME);
    }
});

const upload = multer({storage}).array("upload", 3);


var users = new Users();

var adminUser = { id : uuidv1(), name : 'Admin'};

if (!process.env.PORT)
	process.env.PORT = 300;

app.use(express.static(publicPath));
app.use(bodyParser.json());

app.post("/upload", function (req, res) {
    upload(req, res, function (err) { 
        if (err){
        	console.log(err);
            return res.send({ err : "Something went wrong!"}); 
        }
        else
        {
        	var newUuid = uuidv1();
        	var newPath = path.join(UPLOAD_DIR, newUuid);
        	var oldPath = path.join(UPLOAD_DIR, DEFAULT_UPLOAD_NAME)
        	fs.rename(oldPath, newPath, function (){
        		res.send({ fileName : newUuid });
        	});
        }
    }); 
});

io.on('connection', (socket) =>{
	socket.on('createMessage', (message, callback) => {
		user = users.getUser(socket.id);
		if ( user && isRealString(message.text) ){
			io.to(user.room).emit('newMessage', generateMessage(user, message.text));
			callback();
		}
	});

	socket.on('createLocationMessage', function(coordinates){
		user = users.getUser(socket.id);
		if (user)
			io.to(user.room).emit('newLocationMessage', generateLocationMessage(user, coordinates.latitude, coordinates.longitude));
	});

	socket.on ('join', function(params, callback){
		if (!isRealString(params.name) || !isRealString(params.room))
			return callback('Name and room name are required');
		socket.join(params.room);

		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room, params.n);
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		socket.emit('newMessage', generateMessage(adminUser, "Welcome to the chat app") );
		socket.broadcast.to(params.room).emit('newMessage', generateMessage (adminUser, `${params.name} has joined`) );
		callback();
	});

	socket.on('disconnect', () => {
		var user = users.removeUser(socket.id);
		if (user)
		{
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
				
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			socket.broadcast.to(user.room).emit('newMessage', generateMessage (adminUser, `${user.name} has left`) );
		}
	});
	
	socket.on('getRooms', () => {
		socket.emit('getRoomsResponse', users.getRooms());
	});
	
});

server.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});