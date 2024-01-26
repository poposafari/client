const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { join } = require('node:path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const database = require('./src/config/database');
const {verifyToken} = require('./src/middleware/authMiddleware');
const AccountRouter = require('./src/routes/AccountRoute');
const GameRouter = require('./src/routes/GameRoute');
const socketio = require('socket.io');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.set('port',process.env.PORT || 8081);
const server = createServer(app);
database.connect();

// 정적 파일 제공 (dist 디렉터리의 index.html 및 bundle.js)
app.use(express.static(join(__dirname, 'dist')));

app.use(cors({
  origin: '*' //모든 요청 승인. 테스트 용도로만 이렇게 놔두도록 하자.
}));
app.get('/',verifyToken,(req, res) => {
    res.status(200).sendFile(join(__dirname, '../client/index.html')); //in game html!!
});

app.use('/account',AccountRouter);
app.use('/game',GameRouter);

server.listen(app.get('port'), () => {
  console.log('server running at '+app.get('port'));
});