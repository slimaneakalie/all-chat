const expect = require('expect');
const { generateMessage } = require('./message');

describe('generateMessage', () => {
	it ('Should generate correct message object', (done) => {
		var obj = { from : 'Admin', text : 'My text' };
		var res = generateMessage(obj.from, obj.text);
		expect(res).toInclude(obj);
		expect(res.createdAt).toBeA('number');
		done();
	});
});