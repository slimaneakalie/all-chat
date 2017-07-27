const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '../public');

const app = express();

if (!process.env.PORT)
	process.env.PORT = 300;

app.use(express.static(publicPath));
app.listen(process.env.PORT, () => {
	console.log("Server started on port : ", process.env.PORT);
});