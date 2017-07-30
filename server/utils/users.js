class Users {
	constructor (){
		this.users = [];
	}

	addUser(id, name, room)
	{
		var newUser = {id, name, room};
		this.users.push(newUser);
		return newUser;
	}

	getUserList(room)
	{
		var usersResult = this.users.filter((user) => user.room == room);
		usersResult = usersResult.map((user) => user.name);
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
}

module.exports = { Users };