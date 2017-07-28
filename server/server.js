const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { generateMessage } = require('./utils/message');

if (!process.env.PORT)
	process.env.PORT = 300;

app.use(express.static(publicPath));
io.on('connection', (socket) =>{
	console.log('New user connected');
	socket.on('disconnect', () => {
		console.log("New user disconnected");
	});

	socket.emit('newMessage', generateMessage ('Admin', "Welcome to the chat app") );
	socket.broadcast.emit('newMessage', generateMessage ('Admin', "New user joined") );

	socket.on('createMessage', (message, callback) => {
		io.emit('newMessage', generateMessage(message.from, message.text));
		callback('Got it');
		/* socket.broadcast.emit('newMessage',generateMessage(message.from, message.text)); */
	});
});

server.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});