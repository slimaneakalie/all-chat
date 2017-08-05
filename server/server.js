const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '../images'));
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({storage}).array("upload", 3);

var users = new Users();

if (!process.env.PORT)
	process.env.PORT = 300;

app.use(express.static(publicPath));
app.use(bodyParser.json());

app.post("/upload", function (req, res) {
	console.log('Upload post invoked');
    upload(req, res, function (err) { 
        if (err){
        	console.log(err);
            return res.end("Something went wrong!"); 
        }
        return res.end("File uploaded sucessfully!."); 
    }); 
});

io.on('connection', (socket) =>{
	socket.on('createMessage', (message, callback) => {
		user = users.getUser(socket.id);
		if ( user && isRealString(message.text) ){
			io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
			callback();
		}
	});

	socket.on('createLocationMessage', function(coordinates){
		user = users.getUser(socket.id);
		if (user)
			io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coordinates.latitude, coordinates.longitude));
	});

	socket.on ('join', function(params, callback){
		if (!isRealString(params.name) || !isRealString(params.room))
			return callback('Name and room name are required');
		socket.join(params.room);

		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		socket.emit('newMessage', generateMessage ('Admin', "Welcome to the chat app") );
		socket.broadcast.to(params.room).emit('newMessage', generateMessage ('Admin', `${params.name} has joined`) );
		callback();
	});

	socket.on('disconnect', () => {
		var user = users.removeUser(socket.id);
		if (user)
		{
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			socket.broadcast.to(user.room).emit('newMessage', generateMessage ('Admin', `${user.name} has left`) );
		}
	});
	
	socket.on('getRooms', () => {
		socket.emit('getRoomsResponse', users.getRooms());
	});
	
});

server.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});