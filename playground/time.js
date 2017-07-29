const moment = require('moment');
var date = moment();

console.log(date.format('hh : mm a'));
console.log(moment('06:01', 'hh:mm').format('h : mm a'));
