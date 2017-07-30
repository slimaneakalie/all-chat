const expect = require('expect');
const { Users } = require('./Users');
var users = [{
		id : 1,
		name : 'Slimane',
		room : 'salon 1'
	},{
		id : 2,
		name : 'Farid',
		room : 'salon 1'
	},{
		id : 3,
		name : 'Said',
		room : 'salon 2'
	}];
var usersInst;
beforeEach(() => {
	usersInst = new Users();
	usersInst.users = users;
});



describe('Users', () => {
	it ('Should add new user' , (done) => {
		var user = {
			id : 1,
			name : 'AKALIA Slimane',
			room : 'salon'
		};
		var usersInst = new Users();
		var resAdd = usersInst.addUser(user.id, user.name, user.room);
		expect(usersInst.users).toEqual([resAdd]);
		done();
	});

	it('Should return names for salon 1', (done) => {
		var res = usersInst.getUserList('salon 1');
		expect(res).toEqual(['Slimane', 'Farid']);
		done();
	});

	it('Should return names for salon 2', (done) => {
		var res = usersInst.getUserList('salon 2');
		expect(res).toEqual(['Said']);
		done();
	});

	it('Should remove a user', (done) => {
		var user = usersInst.removeUser(1);
		expect(user).toEqual({ id : 1, name : 'Slimane', room : 'salon 1' });
		expect(usersInst.users).toEqual([{
			id : 2,
			name : 'Farid',
			room : 'salon 1'
		},{
			id : 3,
			name : 'Said',
			room : 'salon 2'
		}]);
		done();
	});

	it('Should not remove a user', (done) => {
		var user = usersInst.removeUser(50);
		expect(user).toNotExist();
		expect(usersInst.users.length).toBe(3);
		done();
	});

	it('Should find the user', (done) => {
		var user = usersInst.getUser(1);
		expect(user).toEqual({ id : 1, name : 'Slimane', room : 'salon 1' });
		done();
	});

	it('Should not find the user', (done) => {
		var user = usersInst.getUser(50);
		expect(user).toNotExist();
		done();
	});
});