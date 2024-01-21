const database = require('../config/database');

const defaultPetId='000';
const defaultTitle='nu';
const defaultMoney=10000;
const defaultPokeball=30;
const defaultGreatball=0;
const defaultUltraball=0;
const defaultMasterball=0;
const defaultTilePosX=1;
const defaultTilePosY=1;

function signUpRepository(email,nickname,password,type){
    const values = [email,nickname,defaultPetId,password,type,defaultTitle,defaultMoney,defaultPokeball,defaultGreatball,defaultUltraball,defaultMasterball,defaultTilePosX,defaultTilePosY];
    const sql = `insert into user 
    (email,nickname,pet_id,password,type,title,money,item_pokeball,item_greatball,item_ultraball,item_masterball,tilepos_x,tilepos_y) values 
    (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    database.query(sql,values,function(err,result){
        if(err) throw err;
        console.log(result+' insert success!');
    });
    return;
}

exports.signUpRepository = signUpRepository;