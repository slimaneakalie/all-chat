const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

if (!process.env.PORT)
	process.env.PORT = 300;

app.use(express.static(publicPath));
io.on('connection', (socket) =>{
	console.log('New user connected');
	socket.on('disconnect', () => {
		console.log("New user disconnected");
	});

	socket.emit('newMessage', {
		from : 'Admin',
		text : "Welcome to the chat app",
		createdAt : new Date().getTime()
	});

	socket.broadcast.emit('newMessage', {
		from : 'Admin',
		text : 'New user joined',
		createdAt : new Date().getTime()
	});

	socket.on('createMessage', (message) => {
		io.emit('newMessage',{
			from : message.from,
			text : message.text,
			createdAt : new Date().getTime()
		});
		/*socket.broadcast.emit('newMessage',{
			from : message.from,
			text : message.text,
			createdAt : new Date().getTime()
		});*/
	});
});

server.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});