//Require lodash
const _ = require('lodash');
//Require moment
var moment = require('moment');
//User class definition
class Users {
	constructor (){
		this.users = [];
	}

	addUser(id, name, room, fileName)
	{
		var newUser = {id, name, room, fileName, logginAt : moment() };
		this.users.push(newUser);
		return newUser;
	}

	getUserList(room)
	{
		var usersResult = this.users.filter((user) => user.room == room);
		usersResult = usersResult.map((user) => {
			return { name : user.name, fileName : user.fileName, logginAt : user.logginAt };
		});

		return usersResult;
	}

	removeUser(id)
	{
		var userToRemove = this.getUser(id);
		if (userToRemove)
			this.users = this.users.filter((user) =>  user.id != id);
		return userToRemove;
	}

	getUser(id)
	{
		var userRes = this.users.filter((user) => user.id == id);
		return userRes[0];
	}

	getRooms()
	{
		var rooms = _.uniqBy(this.users, 'room').map((user) => user.room);
		return rooms;
	}
}

//Export the users class
module.exports = { Users };