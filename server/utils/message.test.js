const expect = require('expect');
const { generateMessage, generateLocationMessage } = require('./message');

describe('generateMessage', () => {
	it ('Should generate correct message object', (done) => {
		var obj = { from : 'Admin', text : 'My text' };
		var res = generateMessage(obj.from, obj.text);
		expect(res).toInclude(obj);
		expect(res.createdAt).toBeA('number');
		done();
	});
});

describe('generateLocationMessage', () => {
	it('Should generate correct location object', (done) => {
		var obj = { from : 'Admin', latitude : 55, longitude : 32 };
		var url = `https://www.google.com/maps?q=${obj.latitude},${obj.longitude}`;
		var res = generateLocationMessage(obj.from, obj.latitude, obj.longitude);
		
		expect(res).toInclude({from, url};
		expect(res.createdAt).toBeA('number');
		done();
	});
});