const { isRealString } = require('./validation');
const expect = require('expect');

describe('isRealString', () => {
	it('Should reject non-string values', (done) => {
		var res = isRealString(22);
		expect(res).toBe(false);
		var res = isRealString(true);
		expect(res).toBe(false);
		done();
	});

	it('Should reject string with only spaces', (done) => {
		var res = isRealString('         ');
		expect(res).toBe(false);
		done();
	});

	it('Should allow string with non-space characters', (done) => {
		var res = isRealString('Hello world !!!');
		expect(res).toBe(true);
		done();
	});
});