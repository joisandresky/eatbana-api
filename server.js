const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { DB_URL } = require('./config');
const PORT = process.env.PORT || 8080;

const app = express();

mongoose.connect(DB_URL);
mongoose.connection.on('connected', () => {
    console.log('Database Connected!');
});
mongoose.connection.on('error', err => {
    console.log('err to connect to Database', err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes')(app);

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
