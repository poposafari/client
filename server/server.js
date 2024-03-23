const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { join } = require('node:path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const database = require('./config/database');
const {verifyToken} = require('./middleware/authMiddleware');
const AccountRouter = require('./src/routes/AccountRoute');
const GameRouter = require('./src/routes/GameRoute');
const socketio = require('socket.io');
const cookie = require("cookie");
const { io } = require('socket.io-client');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.set('port',process.env.PORT);
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
const wildPokemons = {
  0:{
    pokedex:'001',
    name:'test1',
    posX:1,
    posY:1,
    state:0,
  },
  1:{
    pokedex:'003',
    name:'test3',
    posX:1,
    posY:2,
    state:0
  },
  2:{
    pokedex:'006',
    name:'test4',
    posX:1,
    posY:3,
    state:0
  },
  3:{
    pokedex:'012',
    name:'test1',
    posX:1,
    posY:4,
    state:0
  }
};

gameSocket.on('connection',(socket)=>{
  socket.on('connect-player',(data)=>{
    players[socket.id] = {
      socketId: data.socketId,
      playerObj: null,
      pokedex: data.pokedex,
      nickname: data.nickname,
      spriteIndex: data.spriteIndex,
      money: data.money,
      pokeball: data.pokeball,
      greatball: data.greatball,
      ultraball: data.ultraball,
      masterball: data.masterball,
      player_x: data.player_x,
      player_y: data.player_y,
      pet_x: data.pet_x,
      pet_y: data.pet_y,
    };
    console.log(`connected:`,socket.id,data.nickname);
    socket.emit('connected-players',players);
    socket.emit('on-wild-pokemon',wildPokemons);
    socket.broadcast.emit('connect-player',players[socket.id]);
  });
  socket.on('emit-movement-player',(data)=>{
    socket.broadcast.emit('on-movement-player',data);
  });
  socket.on('emit-save-player',(data)=>{
    players[socket.id].player_x = data.player_x;
    players[socket.id].player_y = data.player_y;
    players[socket.id].pet_x = data.pet_x;
    players[socket.id].pet_y = data.pet_y;
  });
  socket.on('emit-stand-player',()=>{
    socket.broadcast.emit('on-stand-player',{socketId:socket.id});
  });
  socket.on('disconnect',()=>{
    console.log(`disconnected:`,socket.id,players[socket.id].nickname);
    delete players[socket.id];
    socket.broadcast.emit('disconnect-player',socket.id);
  });
  const interval = setInterval(() => {
    
  }, 1000);
});