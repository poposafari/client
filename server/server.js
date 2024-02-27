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

class Queue {
  constructor() {
    this._set = new Set();
  }
  
  enqueue(item) {
    // Serialize the item to a string to store it in the Set
    const serializedItem = JSON.stringify(item);
    this._set.add(serializedItem);
  }
  
  dequeue() {
    // Convert the Set to an array, get the first item, and parse it back to its original object
    const serializedItem = [...this._set][0];
    const item = JSON.parse(serializedItem);
    this._set.delete(serializedItem);
    return item;
  }
  
  length() {
    return this._set.size;
  }
}

const movementQueue = new Queue();
let count = 0;
gameSocket.on('connection',(socket)=>{
  console.log(`connected: `,socket.id);
  socket.on('connect-player',(data)=>{
    players[socket.id] = {
      socketId: data.socketId,
      playerObj: null,
      behavior: null,
      nickname: data.nickname,
      pokedex: data.pokedex,
      spriteIndex: data.spriteIndex,
      player_x: data.player_x,
      player_y: data.player_y,
      pet_x: data.pet_x,
      pet_y: data.pet_y,
    };
    socket.emit('connected-players',players);
    socket.broadcast.emit('connect-player',players[socket.id]);
  });
  socket.on('emit-movement-player',(data)=>{
    movementQueue.enqueue(data);
    socket.broadcast.emit('on-movement-player',movementQueue.dequeue());
  });
  socket.on('disconnect',()=>{
    delete players[socket.id];
    socket.broadcast.emit('disconnect-player',socket.id);
    console.log(`disconnected: `,socket.id);
  });
  socket.on('saveTilePos',(data)=>{
    players[socket.id].tilePosX = data.x;
    players[socket.id].tilePosY = data.y;
  });
});