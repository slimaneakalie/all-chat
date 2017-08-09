//Get the moment object
var moment = require('moment');

//Generate message functions
var generateMessage = (from, text) => {
	return {
		from,
		text,
		createdAt : moment().valueOf()
	}
};

var generateLocationMessage = (from, latitude, longitude) => {
	return {
		from,
		url : `https://www.google.com/maps?q=${latitude},${longitude}`,
		createdAt : moment().valueOf()
	};
};

//Exports the functions
module.exports = { generateMessage, generateLocationMessage };