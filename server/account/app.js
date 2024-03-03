const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { createServer } = require('node:http');
const database = require('../config/database')
const SignInRoute = require('./routes/SignInRoute');
const SignUpRoute = require('./routes/SignUpRoute');

require("dotenv").config();

const app = express();
const server = createServer(app);
const port = process.env.PORT;

database.connect();

app.set('port',port);

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/account/signin',SignInRoute);
app.use('/account/signup',SignUpRoute);

server.listen(app.get('port'), () => {
    console.log('server running at '+app.get('port'));
});