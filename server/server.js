const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { join } = require('node:path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const database = require('./config/database');
const {verifyToken} = require('./middleware/authMiddleware');
const AccountRouter = require('./routes/AccountRoute');
const GameRouter = require('./routes/GameRoute');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.set('port',process.env.PORT || 8081);
const server = createServer(app);
database.connect();

app.use(cors({
  origin: '*' //모든 요청 승인. 테스트 용도로만 이렇게 놔두도록 하자.
}));
app.get('/',verifyToken,(req, res) => {
    res.status(200).sendFile(join(__dirname, '../client/public/html/main.html')); //in game html!!
});

app.use('/account',AccountRouter);
app.use('/game',GameRouter);

server.listen(app.get('port'), () => {
  console.log('server running at '+app.get('port'));
});