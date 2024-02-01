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
const cookie = require("cookie");
const { io } = require('socket.io-client');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.set('port',process.env.PORT || 8081);
const server = createServer(app);
const ioServer = new socketio.Server(server,{cookie:true});
database.connect();

app.use(cors({
  origin: '*' //모든 요청 승인. 테스트 용도로만 이렇게 놔두도록 하자.
}));

app.get('/',verifyToken,(req, res) => {
  if(req.result.auth){
    app.use(express.static(join(__dirname,'..','public')));
    res.status(200).sendFile(join(__dirname,'..','public/index.html')); //in game html!!
  }
  else{
    res.redirect('account/signin');
  }
});

app.use('/account',AccountRouter);
app.use('/game',GameRouter);

server.listen(app.get('port'), () => {
  console.log('server running at '+app.get('port'));
});

const gameSocket = ioServer.of('/game');

const players = {};

gameSocket.on('connection',(socket)=>{
  console.log(`connected: `,socket.id);
  socket.on('newPlayer',(data)=>{
    players[socket.id] = data;
    socket.emit('currentPlayers',players);
    socket.broadcast.emit('newPlayer',players[socket.id]);
    console.log(players[socket.id]);
  });
  socket.on('disconnect',function(){
    console.log(`disconnected: `,socket.id);
    delete players[socket.id];
    socket.broadcast.emit('playerDisconnect',socket.id);
  })
});